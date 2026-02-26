import { xxh3 } from "@node-rs/xxhash";
import { StatusCodes } from "http-status-codes";
import OpenAI from "openai";

import { ClientError } from "modules/clientError";
import { Logger } from "modules/logger";
import { redisClient } from "modules/redis";
import { SYSTEM_PROMPT_EN_US } from "modules/system-prompts/en-US";
import { SYSTEM_PROMPT_ZH_TW } from "modules/system-prompts/zh-TW";
import { TranslationBatch } from "../index";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const logger = new Logger({
  prefix: "function",
}).createChild("translate-batch");

export enum TargetLanguage {
  EN_US = "en-US",
  ZH_TW = "zh-TW",
}

const systemPrompts: Record<TargetLanguage, string> = {
  [TargetLanguage.EN_US]: SYSTEM_PROMPT_EN_US,
  [TargetLanguage.ZH_TW]: SYSTEM_PROMPT_ZH_TW,
};

const MAX_RETRIES = 5;
const LLM_MODEL = "gpt-4.1-nano";
const LLM_MAX_TOKENS = 32768;
const LLM_TEMPERATURE = 0.8;

function getCacheKey(text: string, targetLanguage: TargetLanguage): string {
  return String(xxh3.xxh128(text + targetLanguage));
}

async function getCachedTranslations(
  batch: TranslationBatch,
  targetLanguage: TargetLanguage,
): Promise<{ cached: TranslationBatch; toTranslate: TranslationBatch }> {
  const cached: TranslationBatch = [];
  const toTranslate: TranslationBatch = [];

  for (const item of batch) {
    const key = getCacheKey(item.text, targetLanguage);
    const cachedValue = await redisClient.get(key);

    if (cachedValue) {
      logger.debug(`Using cached translation for ${item.path}.`);
      cached.push({ path: item.path, text: cachedValue });
    } else {
      logger.debug(`Translating ${item.path}.`);
      toTranslate.push(item);
    }
  }

  return { cached, toTranslate };
}

async function cacheTranslations(
  results: TranslationBatch,
  toTranslate: TranslationBatch,
  targetLanguage: TargetLanguage,
): Promise<void> {
  const cachePromises = results.map(async (result) => {
    const original = toTranslate.find((item) => item.path === result.path);
    if (!original) {
      logger.warn(
        `Translation for ${result.path} not found in original batch.`,
      );
      return;
    }
    const key = getCacheKey(original.text, targetLanguage);
    await redisClient.set(key, result.text);
    logger.debug(`Cached translation for ${original.path}.`);
  });

  await Promise.all(cachePromises);
}

async function callTranslationApi(
  toTranslate: TranslationBatch,
  targetLanguage: TargetLanguage,
): Promise<TranslationBatch> {
  const formattedBatch = JSON.stringify({ needToTranslate: toTranslate });
  const startTime = Date.now();

  const completion = await openai.responses.create({
    model: LLM_MODEL,
    max_output_tokens: LLM_MAX_TOKENS,
    temperature: LLM_TEMPERATURE,
    instructions: systemPrompts[targetLanguage],
    input: [{ role: "user", content: formattedBatch }],
    text: {
      format: {
        type: "json_schema",
        name: "translation-result",
        schema: {
          type: "object",
          properties: {
            results: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  path: { type: "string" },
                  text: { type: "string" },
                },
                required: ["path", "text"],
                additionalProperties: false,
              },
              additionalProperties: false,
            },
          },
          required: ["results"],
          additionalProperties: false,
        },
      },
    },
  });

  const response = JSON.parse(completion.output_text) as {
    results: TranslationBatch;
  };

  logger.debug(
    `Translated ${response.results.length} items in ${Date.now() - startTime} ms.`,
  );

  return response.results;
}

function validateResults(
  results: TranslationBatch,
  expectedCount: number,
): void {
  if (results.length !== expectedCount) {
    logger.warn(
      `Translation result length (${results.length}) does not match input length (${expectedCount}).`,
    );
    throw new Error("Mismatched translation result length");
  }
}

export async function translateBatch(
  batch: TranslationBatch,
  targetLanguage: TargetLanguage,
): Promise<TranslationBatch> {
  let retries = 0;

  while (true) {
    logger.debug(
      `[Attempt ${retries + 1}/${MAX_RETRIES + 1}] Starting translation for ${batch.length} items.`,
    );

    const { cached, toTranslate } = await getCachedTranslations(
      batch,
      targetLanguage,
    );

    if (toTranslate.length === 0) {
      logger.debug("All items were found in cache. No translation needed.");
      return cached;
    }

    try {
      const newResults = await callTranslationApi(toTranslate, targetLanguage);
      validateResults(newResults, toTranslate.length);
      await cacheTranslations(newResults, toTranslate, targetLanguage);

      return [...cached, ...newResults];
    } catch (error) {
      retries++;

      if (retries > MAX_RETRIES) {
        const errorMessage = `Translation failed after ${MAX_RETRIES} retries.`;
        logger.error(errorMessage);
        throw new ClientError(
          {
            errorMessage,
            errorObject: { originalError: String(error) },
          },
          StatusCodes.INTERNAL_SERVER_ERROR,
        );
      }

      logger.warn(
        `Translation attempt failed, retrying... Error: ${String(error)}`,
      );
    }
  }
}
