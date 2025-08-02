import { xxh3 } from "@node-rs/xxhash";
import OpenAI from "openai";
import { isJSON } from "class-validator";
import { StatusCodes } from "http-status-codes";

import { Logger } from "modules/logger";
import { SYSTEM_PROMPT_ZH_TW } from "modules/system-prompts/zh-TW";
import { RedisClient } from "modules/redis";
import { SYSTEM_PROMPT_EN_US } from "modules/system-prompts/en-US";
import { ClientError } from "modules/clientError";
import { TranslationBatch } from "../types/translation-batch";

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

export async function translateBatch(
  batch: TranslationBatch,
  targetLanguage: TargetLanguage,
  retries = 0,
): Promise<TranslationBatch> {
  const results: TranslationBatch = [];
  const toTranslate: TranslationBatch = [];

  for (const item of batch) {
    const key = String(xxh3.xxh128(item.text + targetLanguage));
    const cached = await RedisClient.get(key);
    if (cached) {
      logger.debug(`Using cached translation for ${item.path}.`);
      results.push({ path: item.path, text: cached });
    } else {
      logger.debug(`Translating ${item.path}.`);
      toTranslate.push(item);
    }
  }

  if (toTranslate.length === 0) {
    return results;
  }

  const formattedBatch = JSON.stringify({
    needToTranslate: toTranslate,
  });

  const startTime = Date.now();
  const completion = await openai.responses.create({
    model: "gpt-4.1-nano",
    max_output_tokens: 32768,
    temperature: 0.8,
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

  if (isJSON(completion.output_text) === false) {
    logger.warn(
      "Invalid output_text: Expected a non-null JSON object. Retrying translation.",
    );
    if (retries >= MAX_RETRIES) {
      throw new Error(
        `Translation failed after ${MAX_RETRIES} retries: Invalid JSON output.`,
      );
    }
    return translateBatch(batch, targetLanguage, retries + 1);
  }

  const newResults = JSON.parse(completion.output_text)
    .results as TranslationBatch;

  const endTime = Date.now();

  logger.debug(
    `Translated ${toTranslate.length} items in ${endTime - startTime} ms.`,
  );

  if (newResults.length !== toTranslate.length) {
    logger.warn(
      `Translation result length (${newResults.length}) does not match input length (${toTranslate.length}). Retrying translation.`,
    );
    logger.debug(JSON.stringify(toTranslate, null, 2));
    logger.debug(JSON.stringify(newResults, null, 2));

    if (retries >= MAX_RETRIES) {
      throw new ClientError(
        {
          errorMessage: `Translation failed after ${MAX_RETRIES} retries: Mismatched translation result length.`,
          errorObject: {
            toTranslateLength: toTranslate.length,
            newResultsLength: newResults.length,
          },
        },
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
    return translateBatch(batch, targetLanguage, retries + 1);
  }

  for (const tr of newResults) {
    const orig = toTranslate.find((t) => t.path === tr.path);
    if (orig) {
      const key = String(xxh3.xxh128(orig.text + targetLanguage));
      await RedisClient.set(key, tr.text);
      logger.debug(`Cached translation for ${orig.path}.`);
    } else {
      logger.warn(`Translation for ${tr.path} not found in original batch.`);
    }
    results.push(tr);
  }

  return results;
}
