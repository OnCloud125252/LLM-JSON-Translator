import { describe, expect, it } from "bun:test";
import type {
  TargetLanguage,
  TranslationBatch,
  TranslationItem,
} from "../translate-json";
import { extractTextFields } from "../translate-json/modules/extract-text-fields";
import { updateJsonWithTranslations } from "../translate-json/modules/update-json-with-translations";
import { haveSamePaths, haveSameTypes } from "./json-compare";

describe("translateJson - Integration Tests", () => {
  // Helper to simulate translation (mock LLM translator)
  // This mimics what translateBatch does but without calling the actual API
  async function mockTranslate(
    batch: TranslationBatch,
    _targetLanguage: TargetLanguage,
  ): Promise<TranslationBatch> {
    // Simulate translation by prepending "[translated]" to each text
    return batch.map((item) => ({
      path: item.path,
      text: `[translated] ${item.text}`,
    }));
  }

  // Simplified translateJson function for testing (copied from original with mock)
  async function translateJsonWithMock({
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

    const translatedItems: TranslationItem[] = [];

    for (const batch of batches) {
      const results = await mockTranslate(batch, targetLanguage);
      translatedItems.push(...results);
    }

    const translatedJson = updateJsonWithTranslations(
      jsonData,
      translatedItems,
    );
    return translatedJson;
  }

  describe("Path Preservation", () => {
    it("should preserve paths for simple object", async () => {
      const input = { name: "Hello World", message: "Good Day" };

      const result = await translateJsonWithMock({
        jsonData: input,
        batchSize: 10,
        targetLanguage: "zh-TW" as TargetLanguage,
      });

      expect(haveSamePaths(input, result)).toBe(true);
    });

    it("should preserve paths for nested objects", async () => {
      const input = {
        level1: {
          level2: {
            value: "some text here",
          },
        },
      };

      const result = await translateJsonWithMock({
        jsonData: input,
        batchSize: 10,
        targetLanguage: "zh-TW" as TargetLanguage,
      });

      expect(haveSamePaths(input, result)).toBe(true);
    });

    it("should preserve paths for arrays", async () => {
      const input = {
        items: [
          { name: "first item" },
          { name: "second item" },
          { name: "third item" },
        ],
        users: [{ name: "Alice Smith" }, { name: "Bob Jones" }],
      };

      const result = await translateJsonWithMock({
        jsonData: input,
        batchSize: 10,
        targetLanguage: "zh-TW" as TargetLanguage,
      });

      expect(haveSamePaths(input, result)).toBe(true);
    });
  });

  describe("Type Preservation", () => {
    it("should preserve string types", async () => {
      const input = { name: "Hello World", description: "Good Day" };

      const result = await translateJsonWithMock({
        jsonData: input,
        batchSize: 10,
        targetLanguage: "zh-TW" as TargetLanguage,
      });

      expect(haveSameTypes(input, result)).toBe(true);
      expect(typeof (result as { name: unknown }).name).toBe("string");
    });

    it("should preserve number types", async () => {
      const input = { name: "Hello World", count: 42, rate: 3.14 };

      const result = await translateJsonWithMock({
        jsonData: input,
        batchSize: 10,
        targetLanguage: "zh-TW" as TargetLanguage,
      });

      expect(haveSameTypes(input, result)).toBe(true);
      expect(typeof (result as { count: unknown }).count).toBe("number");
    });

    it("should preserve boolean types", async () => {
      const input = { name: "Hello World", active: true, disabled: false };

      const result = await translateJsonWithMock({
        jsonData: input,
        batchSize: 10,
        targetLanguage: "zh-TW" as TargetLanguage,
      });

      expect(haveSameTypes(input, result)).toBe(true);
      expect(typeof (result as { active: unknown }).active).toBe("boolean");
    });

    it("should preserve null types", async () => {
      const input = { name: "Hello World", data: null };

      const result = await translateJsonWithMock({
        jsonData: input,
        batchSize: 10,
        targetLanguage: "zh-TW" as TargetLanguage,
      });

      expect(haveSameTypes(input, result)).toBe(true);
      expect((result as { data: unknown }).data).toBeNull();
    });

    it("should preserve array types", async () => {
      const input = {
        items: [1, 2, 3],
        strings: ["a", "b"],
      };

      const result = await translateJsonWithMock({
        jsonData: input,
        batchSize: 10,
        targetLanguage: "zh-TW" as TargetLanguage,
      });

      expect(haveSameTypes(input, result)).toBe(true);
      expect(Array.isArray((result as { items: unknown }).items)).toBe(true);
    });

    it("should preserve number zero", async () => {
      const input = { name: "Hello World", count: 0 };

      const result = await translateJsonWithMock({
        jsonData: input,
        batchSize: 10,
        targetLanguage: "zh-TW" as TargetLanguage,
      });

      expect(haveSameTypes(input, result)).toBe(true);
      expect((result as { count: unknown }).count).toBe(0);
    });
  });

  describe("Structure Preservation", () => {
    it("should preserve nested object structure", async () => {
      const input = {
        user: {
          profile: {
            name: "John Doe",
            age: 30,
          },
        },
      };

      const result = await translateJsonWithMock({
        jsonData: input,
        batchSize: 10,
        targetLanguage: "zh-TW" as TargetLanguage,
      });

      expect(haveSamePaths(input, result)).toBe(true);
      expect(haveSameTypes(input, result)).toBe(true);
    });

    it("should preserve array length", async () => {
      const input = {
        items: [
          { name: "first item" },
          { name: "second item" },
          { name: "third item" },
          { name: "fourth item" },
          { name: "fifth item" },
        ],
      };

      const result = await translateJsonWithMock({
        jsonData: input,
        batchSize: 10,
        targetLanguage: "zh-TW" as TargetLanguage,
      });

      expect(result).toHaveProperty("items");
      expect((result as { items: unknown }).items as unknown[]).toHaveLength(5);
    });

    it("should preserve deeply nested structure (5+ levels)", async () => {
      const input = {
        l1: {
          l2: {
            l3: {
              l4: {
                l5: {
                  value: "deep text here",
                },
              },
            },
          },
        },
      };

      const result = await translateJsonWithMock({
        jsonData: input,
        batchSize: 10,
        targetLanguage: "zh-TW" as TargetLanguage,
      });

      expect(haveSamePaths(input, result)).toBe(true);
      expect(haveSameTypes(input, result)).toBe(true);
    });

    it("should preserve complex mixed structure", async () => {
      const input = {
        users: [
          { name: "Alice Smith", age: 30, active: true },
          { name: "Bob Jones", age: 25, active: false },
        ],
        metadata: {
          total: 2,
          active: true,
        },
        tags: ["admin user", "regular user"],
      };

      const result = await translateJsonWithMock({
        jsonData: input,
        batchSize: 10,
        targetLanguage: "zh-TW" as TargetLanguage,
      });

      expect(haveSamePaths(input, result)).toBe(true);
      expect(haveSameTypes(input, result)).toBe(true);
    });
  });

  describe("disallowedTranslateKeys", () => {
    it("should not translate disallowed keys", async () => {
      const input = {
        name: "Hello World",
        slug: "hello-world",
        description: "Good Day",
      };

      const result = await translateJsonWithMock({
        jsonData: input,
        batchSize: 10,
        targetLanguage: "zh-TW" as TargetLanguage,
        disallowedTranslateKeys: ["slug"],
      });

      // slug should remain untranslated (original value)
      expect((result as { slug: unknown }).slug).toBe("hello-world");
      // name and description should be translated
      expect((result as { name: unknown }).name).toBe(
        "[translated] Hello World",
      );
      expect((result as { description: unknown }).description).toBe(
        "[translated] Good Day",
      );
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty object", async () => {
      const input = {};

      const result = await translateJsonWithMock({
        jsonData: input,
        batchSize: 10,
        targetLanguage: "zh-TW" as TargetLanguage,
      });

      expect(result).toEqual({});
    });

    it("should handle null values", async () => {
      const input = { name: "Hello World", data: null };

      const result = await translateJsonWithMock({
        jsonData: input,
        batchSize: 10,
        targetLanguage: "zh-TW" as TargetLanguage,
      });

      expect(haveSamePaths(input, result)).toBe(true);
      expect(haveSameTypes(input, result)).toBe(true);
      expect((result as { data: unknown }).data).toBeNull();
    });

    it("should handle unicode characters", async () => {
      const input = {
        chinese: "你好世界",
        japanese: "こんにちは世界",
        emoji: "Hello 👋 World",
      };

      const result = await translateJsonWithMock({
        jsonData: input,
        batchSize: 10,
        targetLanguage: "en-US" as TargetLanguage,
      });

      expect(haveSamePaths(input, result)).toBe(true);
      expect(haveSameTypes(input, result)).toBe(true);
    });

    it("should handle empty string fields", async () => {
      const input = { name: "Hello World", empty: "" };

      const result = await translateJsonWithMock({
        jsonData: input,
        batchSize: 10,
        targetLanguage: "zh-TW" as TargetLanguage,
      });

      // Empty string should be skipped, so only name should be translated
      expect(haveSamePaths(input, result)).toBe(true);
      expect((result as { empty: unknown }).empty).toBe("");
    });

    it("should handle whitespace-only strings", async () => {
      const input = { name: "Hello World", whitespace: "   " };

      const result = await translateJsonWithMock({
        jsonData: input,
        batchSize: 10,
        targetLanguage: "zh-TW" as TargetLanguage,
      });

      // Whitespace-only should be skipped
      expect(haveSamePaths(input, result)).toBe(true);
      expect((result as { whitespace: unknown }).whitespace).toBe("   ");
    });
  });
});
