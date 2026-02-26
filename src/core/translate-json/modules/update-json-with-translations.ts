import { TranslationBatch } from "@core/translate-json";
import set from "lodash/set";

export function updateJsonWithTranslations(
  obj: unknown,
  translations: TranslationBatch,
): unknown {
  const result = JSON.parse(JSON.stringify(obj));

  for (const { path, text } of translations) {
    set(result, path, text);
  }

  return result;
}
