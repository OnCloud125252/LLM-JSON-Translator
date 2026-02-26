import { Logger } from "modules/logger";
import { extractTextFields } from "./modules/extract-text-fields";
import { TargetLanguage, translateBatch } from "./modules/translate-batch";
import { updateJsonWithTranslations } from "./modules/update-json-with-translations";
import type { TranslationBatch, TranslationItem } from "./schema";

const logger = new Logger({
  prefix: "function",
}).createChild("translate-json");

const CONCURRENT_BATCH_CHUNK_SIZE = 50;

export type { TranslationItem, TranslationBatch };

export async function translateJson({
  jsonData,
  batchSize,
  targetLanguage,
  disallowedTranslateKeys,
}: {
  jsonData: unknown;
  batchSize: number;
  targetLanguage: TargetLanguage;
  disallowedTranslateKeys?: string[];
}): Promise<unknown> {
  const batches = extractTextFields(
    jsonData,
    batchSize,
    disallowedTranslateKeys,
  );
  logger.debug(`Created ${batches.length} batches for translation`);

  const translatedItems: TranslationItem[] = [];

  for (let i = 0; i < batches.length; i += CONCURRENT_BATCH_CHUNK_SIZE) {
    const chunk = batches.slice(i, i + CONCURRENT_BATCH_CHUNK_SIZE);

    logger.debug(
      `Processing batches ${i + 1} to ${i + chunk.length} of ${batches.length}...`,
    );

    const results = await Promise.all(
      chunk.map((batch) => translateBatch(batch, targetLanguage)),
    );

    translatedItems.push(...results.flat());
  }

  const translatedJson = updateJsonWithTranslations(jsonData, translatedItems);

  logger.debug("JSON translation completed");
  return translatedJson;
}

export { TargetLanguage };
