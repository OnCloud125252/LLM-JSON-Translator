import { TranslationBatch } from "@core/translate-json";
import set from "lodash/set";

/**
 * Creates a structural clone of the input object.
 * Uses a stack-based approach to avoid stack overflow on deeply nested objects.
 */
function structuralClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map((item) => structuralClone(item)) as unknown as T;
  }

  // Handle objects
  const cloned: Record<string, unknown> = {};
  for (const key of Object.keys(obj as Record<string, unknown>)) {
    cloned[key] = structuralClone((obj as Record<string, unknown>)[key]);
  }
  return cloned as T;
}

/**
 * Updates a JSON object with translated text fields.
 * Uses structural cloning for immutability, which is more memory-efficient
 * than JSON.parse(JSON.stringify()) for large objects.
 */
export function updateJsonWithTranslations(
  obj: unknown,
  translations: TranslationBatch,
): unknown {
  const result = structuralClone(obj) as Record<string, unknown>;

  for (const { path, text } of translations) {
    set(result, path, text);
  }

  return result;
}
