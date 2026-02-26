import { z } from "zod";

/**
 * Creates the Zod schema for translation items with language-specific descriptions.
 * @param targetLanguage - The target language for translation
 * @returns Zod object schema for translation items
 */
function createTranslationItemSchema(targetLanguage: string) {
  return z.object({
    path: z
      .string()
      .describe(
        "The exact JSON path to the text field. Preserve this value character-for-character.",
      ),
    text: z
      .string()
      .describe(
        `The translated text in ${targetLanguage}. Empty strings should remain empty. Preserve escape sequences (\\n, \\t, etc.).`,
      ),
  });
}

/**
 * Creates the Zod schema for translation results with language-specific descriptions.
 * @param targetLanguage - The target language for translation (e.g., "English (US)", "Traditional Chinese")
 * @returns Object containing the schemas and JSON schema for OpenAI API
 */
export function createTranslationSchemas(targetLanguage: string) {
  const TranslationItemSchema = createTranslationItemSchema(targetLanguage);

  const TranslationBatchSchema = z.array(TranslationItemSchema);

  const TranslationResultSchema = z.object({
    results: TranslationBatchSchema.describe(
      "Array of translated items. Must maintain the same order as the input array (results[0] corresponds to needToTranslate[0]).",
    ),
  });

  const TranslationResultJsonSchema = {
    type: "object",
    properties: {
      results: {
        type: "array",
        description:
          "Array of translated items. Must maintain the same order as the input array (results[0] corresponds to needToTranslate[0]).",
        items: {
          type: "object",
          description: `A translated item with the path preserved and text translated to ${targetLanguage}.`,
          properties: {
            path: {
              type: "string",
              description:
                "The exact JSON path to the text field. Preserve this value character-for-character.",
            },
            text: {
              type: "string",
              description: `The translated text in ${targetLanguage}. Empty strings should remain empty. Preserve escape sequences (\\n, \\t, etc.).`,
            },
          },
          required: ["path", "text"],
          additionalProperties: false,
        },
        additionalProperties: false,
      },
    },
    required: ["results"],
    additionalProperties: false,
  } as const;

  return {
    TranslationItemSchema,
    TranslationBatchSchema,
    TranslationResultSchema,
    TranslationResultJsonSchema,
  };
}

/**
 * Schema for individual translation items.
 * Represents a single text field that needs translation with its JSON path.
 */
export const TranslationItemSchema = z.object({
  path: z.string(),
  text: z.string(),
});

/**
 * Schema for the translation batch.
 * An array of translation items processed together.
 */
export const TranslationBatchSchema = z.array(TranslationItemSchema);

/**
 * Schema for the OpenAI API response structure.
 * The API returns an object with a results array containing translated items.
 */
export const TranslationResultSchema = z.object({
  results: TranslationBatchSchema,
});

/**
 * JSON schema for OpenAI API structured output.
 * Generated from the Zod schema to ensure consistency.
 */
export const TranslationResultJsonSchema = {
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
} as const;

/**
 * Inferred TypeScript type for a translation item.
 */
export type TranslationItem = z.infer<typeof TranslationItemSchema>;

/**
 * Inferred TypeScript type for a batch of translation items.
 */
export type TranslationBatch = z.infer<typeof TranslationBatchSchema>;

/**
 * Inferred TypeScript type for the translation API response.
 */
export type TranslationResult = z.infer<typeof TranslationResultSchema>;
