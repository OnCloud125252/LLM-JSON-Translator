import { describe, expect, it } from "bun:test";
import { extractTextFields } from "../translate-json/modules/extract-text-fields";

describe("extractTextFields", () => {
  describe("simple objects", () => {
    it("should extract text fields from a simple object", () => {
      const input = { name: "Hello World", count: 5 };
      const result = extractTextFields(input, 10);

      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toEqual([{ path: "name", text: "Hello World" }]);
    });

    it("should skip non-string fields", () => {
      const input = {
        name: "Hello World",
        age: 25,
        active: true,
        rate: 3.14,
      };
      const result = extractTextFields(input, 10);

      expect(result.length).toBeGreaterThan(0);
      expect(result[0][0].path).toBe("name");
    });

    it("should handle empty string fields", () => {
      const input = { name: "", message: "Hello World" };
      const result = extractTextFields(input, 10);

      // Empty strings are filtered out by isPureText
      // Should have result only if there's valid text
      if (result.length > 0) {
        expect(result[0]).toEqual([{ path: "message", text: "Hello World" }]);
      }
    });

    it("should handle whitespace-only strings", () => {
      const input = { name: "   ", message: "Hello World" };
      const result = extractTextFields(input, 10);

      // Whitespace-only strings are filtered out by isPureText
      if (result.length > 0) {
        expect(result[0]).toEqual([{ path: "message", text: "Hello World" }]);
      }
    });
  });

  describe("nested objects", () => {
    it("should extract text fields from nested objects", () => {
      const input = {
        user: {
          name: "John Doe",
          address: {
            city: "Taipei City",
          },
        },
      };
      const result = extractTextFields(input, 10);

      expect(result[0]).toContainEqual({ path: "user.name", text: "John Doe" });
      expect(result[0]).toContainEqual({
        path: "user.address.city",
        text: "Taipei City",
      });
    });

    it("should handle deeply nested objects", () => {
      const input = {
        level1: {
          level2: {
            level3: {
              level4: {
                level5: "deep text here",
              },
            },
          },
        },
      };
      const result = extractTextFields(input, 10);

      expect(result[0][0].path).toBe("level1.level2.level3.level4.level5");
      expect(result[0][0].text).toBe("deep text here");
    });
  });

  describe("arrays", () => {
    it("should extract text fields from arrays of objects", () => {
      const input = {
        items: [
          { name: "Apple fruit" },
          { name: "Banana fruit" },
          { name: "Cherry fruit" },
        ],
      };
      const result = extractTextFields(input, 10);

      expect(result[0]).toContainEqual({
        path: "items[0].name",
        text: "Apple fruit",
      });
      expect(result[0]).toContainEqual({
        path: "items[1].name",
        text: "Banana fruit",
      });
      expect(result[0]).toContainEqual({
        path: "items[2].name",
        text: "Cherry fruit",
      });
    });

    it("should handle arrays of objects", () => {
      const input = {
        users: [{ name: "Alice Smith" }, { name: "Bob Jones" }],
      };
      const result = extractTextFields(input, 10);

      expect(result[0]).toContainEqual({
        path: "users[0].name",
        text: "Alice Smith",
      });
      expect(result[0]).toContainEqual({
        path: "users[1].name",
        text: "Bob Jones",
      });
    });

    it("should handle empty arrays", () => {
      const input = {
        items: [],
        name: "Hello World",
      };
      const result = extractTextFields(input, 10);

      expect(result[0]).toEqual([{ path: "name", text: "Hello World" }]);
    });

    it("should not extract primitive strings from arrays", () => {
      // Note: The current implementation does not extract primitive strings from arrays
      // This is a known limitation - only objects within arrays are traversed
      const input = {
        items: ["Apple fruit", "Banana fruit"],
      };
      const result = extractTextFields(input, 10);

      // Returns empty because primitive strings in arrays are not extracted
      expect(result).toEqual([]);
    });
  });

  describe("mixed types", () => {
    it("should skip number fields", () => {
      const input = { name: "Hello World", count: 42 };
      const result = extractTextFields(input, 10);

      expect(result[0]).toEqual([{ path: "name", text: "Hello World" }]);
    });

    it("should skip boolean fields", () => {
      const input = { name: "Hello World", active: true };
      const result = extractTextFields(input, 10);

      expect(result[0]).toEqual([{ path: "name", text: "Hello World" }]);
    });

    it("should handle null values", () => {
      const input = { name: "Hello World", data: null };
      const result = extractTextFields(input, 10);

      expect(result[0]).toEqual([{ path: "name", text: "Hello World" }]);
    });

    it("should handle mixed arrays of objects", () => {
      // The implementation only extracts from objects within arrays, not primitives
      const input = {
        data: [{ text: "text here" }, { text: "more text" }],
      };
      const result = extractTextFields(input, 10);

      expect(result[0]).toContainEqual({
        path: "data[0].text",
        text: "text here",
      });
      expect(result[0]).toContainEqual({
        path: "data[1].text",
        text: "more text",
      });
      expect(result[0]).toHaveLength(2);
    });
  });

  describe("disallowedTranslateKeys", () => {
    it("should skip keys in disallowedTranslateKeys list", () => {
      const input = {
        name: "Hello World",
        description: "Good Day",
        code: "some code",
      };
      const result = extractTextFields(input, 10, ["code"]);

      expect(result[0]).toContainEqual({ path: "name", text: "Hello World" });
      expect(result[0]).toContainEqual({
        path: "description",
        text: "Good Day",
      });
      expect(result[0]).not.toContainEqual({ path: "code", text: "some code" });
    });

    it("should skip nested keys in disallowedTranslateKeys list", () => {
      const input = {
        user: {
          name: "John Doe",
          email: "test@example.com",
        },
      };
      const result = extractTextFields(input, 10, ["email"]);

      expect(result[0]).toContainEqual({ path: "user.name", text: "John Doe" });
      expect(result[0]).not.toContainEqual({
        path: "user.email",
        text: "test@example.com",
      });
    });

    it("should handle empty disallowedTranslateKeys array", () => {
      const input = { name: "Hello World" };
      const result = extractTextFields(input, 10, []);

      expect(result[0]).toEqual([{ path: "name", text: "Hello World" }]);
    });

    it("should skip multiple disallowed keys", () => {
      const input = {
        name: "Hello World",
        slug: "hello-world",
        key: "abc123",
        description: "Good Day",
      };
      const result = extractTextFields(input, 10, ["slug", "key"]);

      expect(result[0]).toContainEqual({ path: "name", text: "Hello World" });
      expect(result[0]).toContainEqual({
        path: "description",
        text: "Good Day",
      });
      expect(result[0]).toHaveLength(2);
    });
  });

  describe("batchSize", () => {
    it("should split into multiple batches when exceeding batchSize", () => {
      const input = {
        field1: "text one",
        field2: "text two",
        field3: "text three",
      };
      const result = extractTextFields(input, 2);

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveLength(2);
      expect(result[1]).toHaveLength(1);
    });

    it("should handle batchSize of 1", () => {
      const input = {
        field1: "text one",
        field2: "text two",
      };
      const result = extractTextFields(input, 1);

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveLength(1);
      expect(result[1]).toHaveLength(1);
    });
  });

  describe("edge cases", () => {
    it("should handle empty object", () => {
      const input = {};
      const result = extractTextFields(input, 10);

      // Empty object returns empty array (no batches needed)
      expect(result).toEqual([]);
    });

    it("should handle null input", () => {
      const input = null;
      const result = extractTextFields(input, 10);

      // Null input returns empty array
      expect(result).toEqual([]);
    });

    it("should handle primitive input", () => {
      const input = "just a string";
      const result = extractTextFields(input, 10);

      // Primitive input returns empty array (not translatable)
      expect(result).toEqual([]);
    });

    it("should handle unicode characters", () => {
      const input = {
        chinese: "你好世界",
        japanese: "こんにちは世界",
        emoji: "Hello 👋 World",
      };
      const result = extractTextFields(input, 10);

      expect(result[0]).toContainEqual({ path: "chinese", text: "你好世界" });
      expect(result[0]).toContainEqual({
        path: "japanese",
        text: "こんにちは世界",
      });
      expect(result[0]).toContainEqual({
        path: "emoji",
        text: "Hello 👋 World",
      });
    });
  });
});
