import { xxh3 } from "@node-rs/xxhash";
import OpenAI from "openai";

import { SYSTEM_PROMPT_ZH_TW } from "modules/system-prompts/zh-TW";
import { info } from "modules/info";
import { RedisClient } from "../modules/redis";
import { TranslationBatch } from "../types/translation-batch";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function translateBatch(
  batch: TranslationBatch,
): Promise<TranslationBatch> {
  const results: TranslationBatch = [];
  const toTranslate: TranslationBatch = [];

  for (const item of batch) {
    const key = String(xxh3.xxh128(item.text));
    const cached = await RedisClient.get(key);
    if (cached) {
      info(`Using cached translation for ${item.path}.`);
      results.push({ path: item.path, text: cached });
    } else {
      info(`Translating ${item.path}.`);
      toTranslate.push(item);
    }
  }

  if (toTranslate.length === 0) {
    return results;
  }

  const formattedBatch = toTranslate
    .map((item) => `[${item.path}]: ${item.text}`)
    .join("\n\n");

  const startTime = Date.now();
  const completion = await openai.responses.create({
    model: "gpt-4.1-nano",
    max_output_tokens: 32768,
    temperature: 0.8,
    instructions: SYSTEM_PROMPT_ZH_TW,
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
  const endTime = Date.now();

  info(`Translated ${toTranslate.length} items in ${endTime - startTime} ms.`);

  const newResults = JSON.parse(completion.output_text)
    .results as TranslationBatch;

  for (const tr of newResults) {
    const orig = toTranslate.find((t) => t.path === tr.path);
    if (orig) {
      const key = String(xxh3.xxh128(orig.text));
      await RedisClient.set(key, tr.text);
      info(`Cached translation for ${orig.path}.`);
    }
    results.push(tr);
  }

  return results;
}
