import { TranslationBatch } from "../types/translation-batch";

export function updateJsonWithTranslations(
  obj: any,
  translations: TranslationBatch,
): any {
  const result = JSON.parse(JSON.stringify(obj));

  for (const { path, text } of translations) {
    const pathParts = path.split(/\.|\[|\]/).filter((part) => part !== "");
    let current = result;

    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i];
      if (!Number.isNaN(Number(part))) {
        current = current[Number(part)];
      } else {
        current = current[part];
      }

      if (current === undefined) {
        break;
      }
    }

    if (current !== undefined) {
      const lastPart = pathParts[pathParts.length - 1];
      if (!Number.isNaN(Number(lastPart))) {
        current[Number(lastPart)] = text;
      } else {
        current[lastPart] = text;
      }
    }
  }

  return result;
}
