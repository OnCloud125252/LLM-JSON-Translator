import { TranslationBatch } from "../types/translation-batch";
import { shouldSkipTranslation } from "./should-skip-translation";
import { isPureText } from "./is-pure-text";

export function extractTextFields(
  obj: any,
  batchSize: number,
): TranslationBatch[] {
  const allTextFields: { path: string; text: string }[] = [];

  const collectTextFields = (obj: any, path: string = "") => {
    if (obj !== null && typeof obj === "object" && !Array.isArray(obj)) {
      for (const key in obj) {
        const newPath = path ? `${path}.${key}` : key;
        const value = obj[key];

        if (isPureText(value) && shouldSkipTranslation(key)) {
          allTextFields.push({ path: newPath, text: value });
        } else if (shouldSkipTranslation(key)) {
          collectTextFields(value, newPath);
        }
      }
    } else if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        const newPath = `${path}[${i}]`;
        const value = obj[i];

        if (isPureText(value)) {
          allTextFields.push({ path: newPath, text: value });
        } else {
          collectTextFields(value, newPath);
        }
      }
    }
  };
  collectTextFields(obj, "");

  const batches: TranslationBatch[] = [];
  for (let i = 0; i < allTextFields.length; i += batchSize) {
    batches.push(allTextFields.slice(i, i + batchSize));
  }

  return batches;
}
