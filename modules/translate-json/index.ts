import { isObject } from "class-validator";
import { StatusCodes } from "http-status-codes";

import { Logger } from "modules/logger";
import { ClientError } from "modules/clientError";
import { extractTextFields } from "./modules/extract-text-fields";
import { translateBatch } from "./modules/translate-batch";
import { updateJsonWithTranslations } from "./modules/update-json-with-translations";
import { TranslationBatch } from "./types/translation-batch";

const logger = new Logger().createChild("translate-json");

export async function translateJson({
  jsonData,
  batchSize,
  disallowedTranslateKeys,
}: {
  jsonData: any;
  batchSize: number;
  disallowedTranslateKeys?: string[];
}): Promise<any> {
  if (isObject(jsonData) === false) {
    throw new ClientError(
      {
        errorMessage: "Invalid jsonData: Expected a non-null JSON object.",
      },
      StatusCodes.BAD_REQUEST,
    );
  }

  const batches = extractTextFields(
    jsonData,
    batchSize,
    disallowedTranslateKeys,
  );
  logger.info(`Created ${batches.length} batches for translation`);

  const translatedBatches: TranslationBatch = [];

  for (let i = 0; i < batches.length; i += 50) {
    const chunk = batches.slice(i, Math.min(i + 50, batches.length));

    logger.info(
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

  logger.info("JSON translation completed");
  return translatedJson;
}
