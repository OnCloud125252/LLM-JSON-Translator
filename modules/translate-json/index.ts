import { Logger } from "modules/logger";
import { extractTextFields } from "./modules/extract-text-fields";
import { translateBatch } from "./modules/translate-batch";
import { updateJsonWithTranslations } from "./modules/update-json-with-translations";
import { TranslationBatch } from "./types/translation-batch";

const logger = new Logger({
  prefix: "function",
}).createChild("translate-json");

export async function translateJson({
  jsonData,
  batchSize,
  disallowedTranslateKeys,
}: {
  jsonData: any;
  batchSize: number;
  disallowedTranslateKeys?: string[];
}): Promise<any> {
  const batches = extractTextFields(
    jsonData,
    batchSize,
    disallowedTranslateKeys,
  );
  logger.debug(`Created ${batches.length} batches for translation`);

  const translatedBatches: TranslationBatch = [];

  for (let i = 0; i < batches.length; i += 50) {
    const chunk = batches.slice(i, Math.min(i + 50, batches.length));

    logger.debug(
      `Processing batches ${i + 1} to ${i + chunk.length} of ${batches.length}...`,
    );

    const results = await Promise.all(
      chunk.map((batch) => translateBatch(batch)),
    );

    for (const batchResult of results) {
      translatedBatches.push(...batchResult);
    }
  }

  const translatedJson = updateJsonWithTranslations(
    jsonData,
    translatedBatches,
  );

  logger.debug("JSON translation completed");
  return translatedJson;
}
