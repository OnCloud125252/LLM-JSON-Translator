import { describe, expect, it } from "bun:test";
import type { TranslationBatch } from "@core/translate-json";
import { updateJsonWithTranslations } from "@core/translate-json/modules/update-json-with-translations";

describe("updateJsonWithTranslations", () => {
  describe("simple field updates", () => {
    it("should update a simple field", () => {
      const original = { name: "Hello" };
      const translations: TranslationBatch = [{ path: "name", text: "你好" }];

      const result = updateJsonWithTranslations(original, translations);

      expect(result).toEqual({ name: "你好" });
    });

    it("should update multiple simple fields", () => {
      const original = { name: "Hello", message: "World" };
      const translations: TranslationBatch = [
        { path: "name", text: "你好" },
        { path: "message", text: "世界" },
      ];

      const result = updateJsonWithTranslations(original, translations);

      expect(result).toEqual({ name: "你好", message: "世界" });
    });
  });

  describe("nested object updates", () => {
    it("should update nested object fields", () => {
      const original = {
        user: {
          name: "John",
          age: 30,
        },
      };
      const translations: TranslationBatch = [
        { path: "user.name", text: "約翰" },
      ];

      const result = updateJsonWithTranslations(original, translations);

      expect(result).toEqual({
        user: {
          name: "約翰",
          age: 30,
        },
      });
    });

    it("should update deeply nested fields", () => {
      const original = {
        level1: {
          level2: {
            level3: {
              value: "original",
            },
          },
        },
      };
      const translations: TranslationBatch = [
        { path: "level1.level2.level3.value", text: "translated" },
      ];

      const result = updateJsonWithTranslations(original, translations);

      expect(result).toEqual({
        level1: {
          level2: {
            level3: {
              value: "translated",
            },
          },
        },
      });
    });
  });

  describe("array element updates", () => {
    it("should update array elements", () => {
      const original = {
        items: ["apple", "banana", "cherry"],
      };
      const translations: TranslationBatch = [
        { path: "items[0]", text: "蘋果" },
        { path: "items[1]", text: "香蕉" },
      ];

      const result = updateJsonWithTranslations(original, translations);

      expect(result).toEqual({
        items: ["蘋果", "香蕉", "cherry"],
      });
    });

    it("should update array of objects", () => {
      const original = {
        users: [{ name: "John" }, { name: "Jane" }],
      };
      const translations: TranslationBatch = [
        { path: "users[0].name", text: "約翰" },
        { path: "users[1].name", text: "珍" },
      ];

      const result = updateJsonWithTranslations(original, translations);

      expect(result).toEqual({
        users: [{ name: "約翰" }, { name: "珍" }],
      });
    });
  });

  describe("edge cases", () => {
    it("should not modify original object", () => {
      const original = { name: "Hello" };
      const translations: TranslationBatch = [{ path: "name", text: "你好" }];

      const result = updateJsonWithTranslations(original, translations);

      expect(original).toEqual({ name: "Hello" });
      expect(result).not.toBe(original);
    });

    it("should create nested paths for nonexistent paths", () => {
      const original = { name: "Hello", count: 5 };
      const translations: TranslationBatch = [
        { path: "name", text: "你好" },
        { path: "nonexistent", text: "missing" },
      ];

      const result = updateJsonWithTranslations(original, translations);

      // lodash set() creates the path even if it doesn't exist in original
      expect(result).toHaveProperty("name", "你好");
      expect(result).toHaveProperty("count", 5);
      expect(result).toHaveProperty("nonexistent", "missing");
    });

    it("should handle empty translation batch", () => {
      const original = { name: "Hello" };
      const translations: TranslationBatch = [];

      const result = updateJsonWithTranslations(original, translations);

      expect(result).toEqual({ name: "Hello" });
    });

    it("should create nested paths on empty object", () => {
      const original = {};
      const translations: TranslationBatch = [{ path: "name", text: "你好" }];

      const result = updateJsonWithTranslations(original, translations);

      // lodash set() creates the path even on empty object
      expect(result).toEqual({ name: "你好" });
    });

    it("should preserve non-string types", () => {
      const original = {
        name: "Hello",
        count: 42,
        active: true,
        rate: 3.14,
        data: null,
      };
      const translations: TranslationBatch = [{ path: "name", text: "你好" }];

      const result = updateJsonWithTranslations(original, translations);

      expect(result).toEqual({
        name: "你好",
        count: 42,
        active: true,
        rate: 3.14,
        data: null,
      });
    });

    it("should handle complex mixed structure", () => {
      const original = {
        users: [
          { name: "John", age: 30 },
          { name: "Jane", age: 25 },
        ],
        metadata: {
          total: 2,
          active: true,
        },
      };
      const translations: TranslationBatch = [
        { path: "users[0].name", text: "約翰" },
        { path: "users[1].name", text: "珍" },
      ];

      const result = updateJsonWithTranslations(original, translations);

      expect(result).toEqual({
        users: [
          { name: "約翰", age: 30 },
          { name: "珍", age: 25 },
        ],
        metadata: {
          total: 2,
          active: true,
        },
      });
    });

    it("should handle unicode translations", () => {
      const original = { text: "Hello" };
      const translations: TranslationBatch = [
        { path: "text", text: "你好世界🎉" },
      ];

      const result = updateJsonWithTranslations(original, translations);

      expect(result).toEqual({ text: "你好世界🎉" });
    });
  });
});
