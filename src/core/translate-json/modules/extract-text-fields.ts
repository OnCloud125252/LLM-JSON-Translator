import logger from "@core/logger";
import { TranslationBatch } from "@core/translate-json";
import chunk from "lodash/chunk";
import { isPureText } from "./is-pure-text";
import { shouldSkipTranslation } from "./should-skip-translation";

const fieldLogger = logger.createChild("extract-fields");

interface TextField {
  path: string;
  text: string;
}

function buildPath(parentPath: string, key: string | number): string {
  if (typeof key === "number") {
    return parentPath ? `${parentPath}[${key}]` : `[${key}]`;
  }
  return parentPath ? `${parentPath}.${key}` : key;
}

function collectTextFields(
  value: unknown,
  currentPath: string,
  disallowedKeys: string[],
): TextField[] {
  if (value === null || typeof value !== "object") {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item, index) =>
      collectTextFields(item, buildPath(currentPath, index), disallowedKeys),
    );
  }

  const fields: TextField[] = [];
  const obj = value as Record<string, unknown>;

  for (const [key, val] of Object.entries(obj)) {
    const newPath = buildPath(currentPath, key);

    if (shouldSkipTranslation(key, disallowedKeys)) {
      fieldLogger.debug("Skipping disallowed key", { path: newPath, key });
      continue;
    }

    if (typeof val === "string" && isPureText(val)) {
      fieldLogger.debug("Found text field", {
        path: newPath,
        textLength: val.length,
      });
      fields.push({ path: newPath, text: val });
    } else if (typeof val === "object" && val !== null) {
      fields.push(...collectTextFields(val, newPath, disallowedKeys));
    }
  }

  return fields;
}

export function extractTextFields(
  obj: unknown,
  batchSize: number,
  disallowedTranslateKeys?: string[],
): TranslationBatch[] {
  fieldLogger.debug("Starting text field extraction", {
    batchSize,
    disallowedKeys: disallowedTranslateKeys ?? [],
  });

  const allTextFields = collectTextFields(
    obj,
    "",
    disallowedTranslateKeys ?? [],
  );

  const batches = chunk(allTextFields, batchSize);

  fieldLogger.debug("Text field extraction complete", {
    totalFields: allTextFields.length,
    batchCount: batches.length,
  });

  return batches;
}
