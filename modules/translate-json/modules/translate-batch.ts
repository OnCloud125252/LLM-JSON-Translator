import { xxh3 } from "@node-rs/xxhash";
import OpenAI from "openai";
import { isJSON } from "class-validator";

import { Logger } from "modules/logger";
import { SYSTEM_PROMPT_ZH_TW } from "modules/system-prompts/zh-TW";
import { RedisClient } from "modules/redis";
import { TranslationBatch } from "../types/translation-batch";
import { SYSTEM_PROMPT_EN_US } from "modules/system-prompts/en-US";

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

export async function translateBatch(
  batch: TranslationBatch,
  targetLanguage: TargetLanguage,
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

  const formattedBatch = toTranslate
    .map((item) => `"${item.path}": ${item.text}`)
    .join("\n\n");

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
    return translateBatch(batch, targetLanguage);
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
    return translateBatch(batch, targetLanguage);
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
