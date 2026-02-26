import { ClientError } from "@core/clientError";
import { Logger } from "@core/logger";
import { redisClient } from "@core/redis";
import { SYSTEM_PROMPT_EN_US } from "@core/system-prompts/en-US";
import { SYSTEM_PROMPT_ZH_TW } from "@core/system-prompts/zh-TW";
import { TokenCalculator } from "@core/translate-json/modules/token-calculator";
import {
  createTranslationSchemas,
  TranslationBatch,
  TranslationResultSchema,
} from "@core/translate-json/schema";
import { xxh3 } from "@node-rs/xxhash";
import { StatusCodes } from "http-status-codes";
import OpenAI from "openai";

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

const languageNames: Record<TargetLanguage, string> = {
  [TargetLanguage.EN_US]: "English (US)",
  [TargetLanguage.ZH_TW]: "Traditional Chinese (繁體中文)",
};

const MAX_RETRIES = Number(process.env.MAX_RETRIES) || 5;
const LLM_MODEL = process.env.LLM_MODEL || "gpt-4.1-mini";
const LLM_MAX_TOKENS = 32768;
const LLM_TEMPERATURE = 0.8;
const CACHE_KEY_MEMOIZATION_LIMIT =
  Number(process.env.CACHE_KEY_MEMOIZATION_LIMIT) || 10000;

// Initialize token calculator for the configured model
const tokenCalculator = new TokenCalculator(LLM_MODEL);

// LRU cache for memoizing cache key computations
const cacheKeyMemo = new Map<string, string>();

function getCacheKey(text: string, targetLanguage: TargetLanguage): string {
  // For short texts, use simple string concatenation to avoid hash overhead
  if (text.length < 100) {
    return `${text}:${targetLanguage}`;
  }

  const memoKey = text + targetLanguage;

  // Check memoized cache keys
  const memoized = cacheKeyMemo.get(memoKey);
  if (memoized) {
    return memoized;
  }

  // Compute hash and store in memoization cache
  const hash = String(xxh3.xxh128(memoKey));

  // Evict oldest entries if at capacity
  if (cacheKeyMemo.size >= CACHE_KEY_MEMOIZATION_LIMIT) {
    const firstKey = cacheKeyMemo.keys().next().value;
    if (firstKey !== undefined) {
      cacheKeyMemo.delete(firstKey);
    }
  }

  cacheKeyMemo.set(memoKey, hash);
  return hash;
}

async function getCachedTranslations(
  batch: TranslationBatch,
  targetLanguage: TargetLanguage,
): Promise<{ cached: TranslationBatch; toTranslate: TranslationBatch }> {
  const cached: TranslationBatch = [];
  const toTranslate: TranslationBatch = [];

  // Parallelize cache lookups for better performance
  const cachePromises = batch.map(async (item) => {
    const key = getCacheKey(item.text, targetLanguage);
    const cachedValue = await redisClient.get(key);
    return { item, cachedValue };
  });

  const results = await Promise.all(cachePromises);

  for (const { item, cachedValue } of results) {
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

    // Only cache if the text was actually translated (changed)
    if (original.text === result.text) {
      logger.debug(
        `Skipping cache for ${original.path} - text unchanged (likely already in target language).`,
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
  formattedBatch?: string,
): Promise<TranslationBatch> {
  // Use pre-formatted batch if provided (from token calculator), otherwise stringify
  const batchString =
    formattedBatch ?? JSON.stringify({ needToTranslate: toTranslate });
  const startTime = Date.now();

  const { TranslationResultJsonSchema } = createTranslationSchemas(
    languageNames[targetLanguage],
  );

  const completion = await openai.responses.create({
    model: LLM_MODEL,
    max_output_tokens: LLM_MAX_TOKENS,
    temperature: LLM_TEMPERATURE,
    instructions: systemPrompts[targetLanguage],
    input: [{ role: "user", content: batchString }],
    text: {
      format: {
        type: "json_schema",
        name: "translation-result",
        schema: TranslationResultJsonSchema,
      },
    },
  });

  const parsed = TranslationResultSchema.safeParse(
    JSON.parse(completion.output_text),
  );

  if (!parsed.success) {
    logger.error(`Invalid response format: ${parsed.error.message}`);
    throw new Error(`Response validation failed: ${parsed.error.message}`);
  }

  logger.debug(
    `Translated ${parsed.data.results.length} items in ${Date.now() - startTime} ms.`,
  );

  return parsed.data.results;
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

/**
 * Recursively translate a batch with token safety checking.
 * Splits batches that exceed the token limit into smaller chunks.
 */
async function translateBatchWithTokenCheck(
  batch: TranslationBatch,
  targetLanguage: TargetLanguage,
): Promise<TranslationBatch> {
  // Check token count including system prompt
  const systemPrompt = systemPrompts[targetLanguage];
  const tokenEstimate = tokenCalculator.estimateBatchTokens(
    batch,
    systemPrompt,
  );
  const maxTokens = tokenCalculator.getMaxInputTokens();

  logger.debug(
    `Token estimate for batch of ${batch.length} items: ${tokenEstimate.totalTokens} tokens (max safe: ${maxTokens})`,
  );

  // If batch is within limits, translate normally
  if (tokenEstimate.totalTokens <= maxTokens) {
    return translateBatchInternal(
      batch,
      targetLanguage,
      tokenEstimate.formattedBatch,
    );
  }

  // If single field is too large, throw error
  if (batch.length === 1) {
    const item = batch[0];
    const errorMessage = `Text field at path '${item.path}' is too large to translate (${tokenEstimate.totalTokens} tokens). Maximum safe size is ${maxTokens} tokens. Consider splitting this text into smaller chunks.`;
    logger.error(errorMessage);
    throw new ClientError(
      {
        errorMessage,
        errorObject: {
          path: item.path,
          tokenCount: tokenEstimate.totalTokens,
          maxTokens,
        },
      },
      StatusCodes.BAD_REQUEST,
    );
  }

  // Split batch in half and process recursively
  const mid = Math.floor(batch.length / 2);
  const firstHalf = batch.slice(0, mid);
  const secondHalf = batch.slice(mid);

  logger.debug(
    `Batch too large (${tokenEstimate.totalTokens} tokens), splitting into ${firstHalf.length} and ${secondHalf.length} items`,
  );

  // Process both halves in parallel
  const [firstResults, secondResults] = await Promise.all([
    translateBatchWithTokenCheck(firstHalf, targetLanguage),
    translateBatchWithTokenCheck(secondHalf, targetLanguage),
  ]);

  return [...firstResults, ...secondResults];
}

/**
 * Internal batch translation with retry logic.
 * This function handles caching and API calls for a single batch.
 */
async function translateBatchInternal(
  batch: TranslationBatch,
  targetLanguage: TargetLanguage,
  formattedBatch?: string,
): Promise<TranslationBatch> {
  let retries = 0;

  while (true) {
    logger.debug(
      `[Attempt ${retries + 1}/${MAX_RETRIES}] Starting translation for ${batch.length} items.`,
    );

    try {
      const newResults = await callTranslationApi(
        batch,
        targetLanguage,
        formattedBatch,
      );
      validateResults(newResults, batch.length);
      await cacheTranslations(newResults, batch, targetLanguage);

      return newResults;
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

/**
 * Main entry point for batch translation with token safety checking.
 * Checks cache first, then translates uncached items with automatic
 * batch splitting if token limits would be exceeded.
 */
export async function translateBatch(
  batch: TranslationBatch,
  targetLanguage: TargetLanguage,
): Promise<TranslationBatch> {
  // First, check the cache for all items
  const { cached, toTranslate } = await getCachedTranslations(
    batch,
    targetLanguage,
  );

  if (toTranslate.length === 0) {
    logger.debug("All items were found in cache. No translation needed.");
    return cached;
  }

  // Translate uncached items with token safety checking
  const newResults = await translateBatchWithTokenCheck(
    toTranslate,
    targetLanguage,
  );

  return [...cached, ...newResults];
}
