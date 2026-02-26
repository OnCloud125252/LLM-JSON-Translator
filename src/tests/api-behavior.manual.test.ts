import { beforeAll, describe, expect, it } from "bun:test";
import { haveSamePaths, haveSameTypes } from "@core/json-compare";
import { TargetLanguage } from "@core/translate-json/modules/translate-batch";

/**
 * Manual API Behavior Test
 *
 * This test makes actual HTTP requests to a running server to verify
 * the API behavior documented in docs/translation-behavior.md.
 *
 * Required environment variables:
 * - APP_API_KEY: API key for authorization
 * - API_BASE_URL: Server URL (optional, defaults to http://127.0.0.1:3000)
 *
 * Run the test:
 *   RUN_MANUAL_TESTS=1 bun test src/tests/api-behavior.manual.test.ts
 */

const API_BASE_URL = process.env.API_BASE_URL || "http://127.0.0.1:3000";
const APP_API_KEY = process.env.APP_API_KEY;

interface TranslationRequest {
  json: object;
  targetLanguage: TargetLanguage;
  disallowedTranslateKeys?: string[];
}

interface TranslationResponse {
  [key: string]: unknown;
}

/**
 * Makes a translation request to the API.
 */
async function makeTranslationRequest(
  requestBody: TranslationRequest,
  customHeaders?: Record<string, string>,
): Promise<{ response: Response; data: TranslationResponse | null }> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${APP_API_KEY}`,
    ...customHeaders,
  };

  const response = await fetch(`${API_BASE_URL}/translate`, {
    method: "POST",
    headers,
    body: JSON.stringify(requestBody),
  });

  let data: TranslationResponse | null = null;
  if (response.headers.get("content-type")?.includes("application/json")) {
    data = (await response.json()) as TranslationResponse;
  }

  return { response, data };
}

const describeManual = process.env.RUN_MANUAL_TESTS ? describe : describe.skip;

describeManual("Translation API Behavior - Manual Test", () => {
  let serverAvailable = false;

  beforeAll(async () => {
    if (!APP_API_KEY) {
      console.warn(
        "\n⚠️  Skipping manual API tests: APP_API_KEY environment variable is not set",
      );
      return;
    }

    try {
      const healthCheck = await fetch(`${API_BASE_URL}/health`, {
        method: "GET",
        signal: AbortSignal.timeout(5000),
      });
      serverAvailable = healthCheck.ok;

      if (!serverAvailable) {
        console.warn(
          `\n⚠️  Server at ${API_BASE_URL} is not responding correctly (status: ${healthCheck.status})`,
        );
      }
    } catch {
      console.warn(
        `\n⚠️  Skipping manual API tests: Server at ${API_BASE_URL} is not running`,
      );
    }
  });

  // Helper to skip tests when server is unavailable
  const skipIfUnavailable = () => {
    if (!serverAvailable || !APP_API_KEY) {
      return true;
    }
    return false;
  };

  describe("Server Connection", () => {
    it("should have server running and accessible", () => {
      if (!APP_API_KEY) {
        expect(APP_API_KEY).toBeTruthy();
        return;
      }
      expect(serverAvailable).toBe(true);
    });
  });

  describe("Translation Output", () => {
    it("should translate text to target language", async () => {
      if (skipIfUnavailable()) {
        return;
      }

      const input = { greeting: "Hello World", farewell: "Goodbye" };

      const { response, data } = await makeTranslationRequest({
        json: input,
        targetLanguage: TargetLanguage.ZH_TW,
      });

      expect(response.status).toBe(200);
      expect(data).toBeDefined();

      // Text should be translated to Chinese
      const greeting = (data as { greeting: string }).greeting;
      const farewell = (data as { farewell: string }).farewell;

      // Verify text is translated (not the original English)
      expect(greeting).not.toBe("Hello World");
      expect(farewell).not.toBe("Goodbye");

      // Verify translated text contains Chinese characters
      expect(/[\u4e00-\u9fff]/.test(greeting)).toBe(true);
      expect(/[\u4e00-\u9fff]/.test(farewell)).toBe(true);
    });
  });

  describe("Path Preservation", () => {
    it("should preserve root property paths", async () => {
      if (skipIfUnavailable()) {
        return;
      }

      const input = { name: "Hello World", message: "Good Day" };

      const { response, data } = await makeTranslationRequest({
        json: input,
        targetLanguage: TargetLanguage.ZH_TW,
      });

      expect(response.status).toBe(200);
      expect(data).toBeDefined();
      expect(haveSamePaths(input, data)).toBe(true);
    });

    it("should preserve nested object paths", async () => {
      if (skipIfUnavailable()) {
        return;
      }

      const input = {
        user: {
          name: "John Doe",
          profile: {
            bio: "Software developer",
          },
        },
      };

      const { response, data } = await makeTranslationRequest({
        json: input,
        targetLanguage: TargetLanguage.ZH_TW,
      });

      expect(response.status).toBe(200);
      expect(data).toBeDefined();
      expect(haveSamePaths(input, data)).toBe(true);
    });

    it("should preserve array element paths", async () => {
      if (skipIfUnavailable()) {
        return;
      }

      const input = {
        items: ["first item", "second item", "third item"],
        tags: ["tag1", "tag2"],
      };

      const { response, data } = await makeTranslationRequest({
        json: input,
        targetLanguage: TargetLanguage.ZH_TW,
      });

      expect(response.status).toBe(200);
      expect(data).toBeDefined();
      expect(haveSamePaths(input, data)).toBe(true);
    });

    it("should preserve deep nesting paths", async () => {
      if (skipIfUnavailable()) {
        return;
      }

      const input = {
        data: [{ name: "First Item" }, { name: "Second Item" }],
      };

      const { response, data } = await makeTranslationRequest({
        json: input,
        targetLanguage: TargetLanguage.ZH_TW,
      });

      expect(response.status).toBe(200);
      expect(data).toBeDefined();
      expect(haveSamePaths(input, data)).toBe(true);
    });

    it("should preserve deeply nested structure (5+ levels)", async () => {
      if (skipIfUnavailable()) {
        return;
      }

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

      const { response, data } = await makeTranslationRequest({
        json: input,
        targetLanguage: TargetLanguage.ZH_TW,
      });

      expect(response.status).toBe(200);
      expect(data).toBeDefined();
      expect(haveSamePaths(input, data)).toBe(true);
      expect(haveSameTypes(input, data)).toBe(true);
    });

    it("should preserve complex mixed structures", async () => {
      if (skipIfUnavailable()) {
        return;
      }

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

      const { response, data } = await makeTranslationRequest({
        json: input,
        targetLanguage: TargetLanguage.ZH_TW,
      });

      expect(response.status).toBe(200);
      expect(data).toBeDefined();
      expect(haveSamePaths(input, data)).toBe(true);
      expect(haveSameTypes(input, data)).toBe(true);
    });
  });

  describe("Type Preservation", () => {
    it("should preserve string types", async () => {
      if (skipIfUnavailable()) {
        return;
      }

      const input = { name: "Hello World", description: "Good Day" };

      const { response, data } = await makeTranslationRequest({
        json: input,
        targetLanguage: TargetLanguage.ZH_TW,
      });

      expect(response.status).toBe(200);
      expect(data).toBeDefined();
      expect(haveSameTypes(input, data)).toBe(true);
      expect(typeof (data as { name: unknown }).name).toBe("string");
    });

    it("should preserve number types (including zero)", async () => {
      if (skipIfUnavailable()) {
        return;
      }

      const input = { name: "Test", count: 42, rate: 3.14, zero: 0 };

      const { response, data } = await makeTranslationRequest({
        json: input,
        targetLanguage: TargetLanguage.ZH_TW,
      });

      expect(response.status).toBe(200);
      expect(data).toBeDefined();
      expect(haveSameTypes(input, data)).toBe(true);
      expect(typeof (data as { count: unknown }).count).toBe("number");
      expect((data as { zero: unknown }).zero).toBe(0);
    });

    it("should preserve boolean types", async () => {
      if (skipIfUnavailable()) {
        return;
      }

      const input = { name: "Test", active: true, disabled: false };

      const { response, data } = await makeTranslationRequest({
        json: input,
        targetLanguage: TargetLanguage.ZH_TW,
      });

      expect(response.status).toBe(200);
      expect(data).toBeDefined();
      expect(haveSameTypes(input, data)).toBe(true);
      expect(typeof (data as { active: unknown }).active).toBe("boolean");
      expect((data as { active: unknown }).active).toBe(true);
      expect((data as { disabled: unknown }).disabled).toBe(false);
    });

    it("should preserve null values", async () => {
      if (skipIfUnavailable()) {
        return;
      }

      const input = { name: "Test", data: null, empty: null };

      const { response, data } = await makeTranslationRequest({
        json: input,
        targetLanguage: TargetLanguage.ZH_TW,
      });

      expect(response.status).toBe(200);
      expect(data).toBeDefined();
      expect(haveSameTypes(input, data)).toBe(true);
      expect((data as { data: unknown }).data).toBeNull();
    });

    it("should preserve array structure and length", async () => {
      if (skipIfUnavailable()) {
        return;
      }

      const input = {
        items: [1, 2, 3, 4, 5],
        strings: ["a", "b", "c"],
        mixed: ["text", 123, true, null],
      };

      const { response, data } = await makeTranslationRequest({
        json: input,
        targetLanguage: TargetLanguage.ZH_TW,
      });

      expect(response.status).toBe(200);
      expect(data).toBeDefined();
      expect(haveSameTypes(input, data)).toBe(true);
      expect(Array.isArray((data as { items: unknown }).items)).toBe(true);
      expect((data as { items: unknown[] }).items.length).toBe(5);
      expect((data as { strings: unknown[] }).strings.length).toBe(3);
      expect((data as { mixed: unknown[] }).mixed.length).toBe(4);
    });
  });

  describe("Eligible Fields - Text Detection", () => {
    // These patterns should NOT be translated (preserved as-is)
    const nonTranslatablePatterns = [
      { name: "Base64", value: "SGVsbG8gV29ybGQ=" },
      { name: "Credit Card", value: "4111111111111111" },
      { name: "Currency", value: "$1,234.56" },
      { name: "Email", value: "user@example.com" },
      { name: "FQDN", value: "api.example.com" },
      { name: "Hexadecimal with prefix", value: "0x1a2b3c" },
      { name: "Hexadecimal uppercase", value: "1A2B3C" },
      { name: "IPv4", value: "192.168.1.1" },
      { name: "IPv6", value: "::1" },
      { name: "ISBN", value: "978-3-16-148410-0" },
      { name: "ISIN", value: "US0378331005" },
      { name: "ISO 8601 Date", value: "2024-01-15T10:30:00Z" },
      { name: "Mobile Phone", value: "+1-555-123-4567" },
      { name: "MongoDB ObjectId", value: "507f1f77bcf86cd799439011" },
      { name: "Integer string", value: "12345" },
      { name: "Negative decimal", value: "-999.50" },
      { name: "URL", value: "https://example.com" },
      { name: "UUID", value: "550e8400-e29b-41d4-a716-446655440000" },
      { name: "Locale code", value: "en-US" },
      { name: "Locale code zh-TW", value: "zh-TW" },
    ];

    for (const pattern of nonTranslatablePatterns) {
      it(`should NOT translate ${pattern.name}: ${pattern.value}`, async () => {
        if (skipIfUnavailable()) {
          return;
        }

        const input = {
          text: "Hello World",
          [pattern.name.toLowerCase().replace(/\s+/g, "_")]: pattern.value,
        };

        const { response, data } = await makeTranslationRequest({
          json: input,
          targetLanguage: TargetLanguage.ZH_TW,
        });

        expect(response.status).toBe(200);
        expect(data).toBeDefined();

        // Non-translatable field should be preserved unchanged
        const key = pattern.name.toLowerCase().replace(/\s+/g, "_");
        expect((data as Record<string, unknown>)[key]).toBe(pattern.value);

        // Text field should be translated (different from original)
        expect((data as { text: string }).text).not.toBe("Hello World");
      });
    }
  });

  describe("Field Exclusion", () => {
    it("should not translate disallowed keys at root level", async () => {
      if (skipIfUnavailable()) {
        return;
      }

      const input = {
        name: "Hello World",
        slug: "hello-world",
        description: "Good Day",
      };

      const { response, data } = await makeTranslationRequest({
        json: input,
        targetLanguage: TargetLanguage.ZH_TW,
        disallowedTranslateKeys: ["slug"],
      });

      expect(response.status).toBe(200);
      expect(data).toBeDefined();

      // slug should remain untranslated
      expect((data as { slug: unknown }).slug).toBe("hello-world");

      // name and description should be translated
      expect((data as { name: string }).name).not.toBe("Hello World");
      expect((data as { description: string }).description).not.toBe(
        "Good Day",
      );
    });

    it("should not translate disallowed keys at any nesting depth", async () => {
      if (skipIfUnavailable()) {
        return;
      }

      const input = {
        id: "root-id",
        name: "Root Name",
        nested: {
          id: "nested-id",
          title: "Nested Title",
          deep: {
            id: "deep-id",
            content: "Deep Content",
          },
        },
      };

      const { response, data } = await makeTranslationRequest({
        json: input,
        targetLanguage: TargetLanguage.ZH_TW,
        disallowedTranslateKeys: ["id"],
      });

      expect(response.status).toBe(200);
      expect(data).toBeDefined();

      // All id fields should remain untranslated
      expect((data as { id: unknown }).id).toBe("root-id");
      expect((data as { nested: { id: unknown } }).nested.id).toBe("nested-id");
      expect(
        (data as { nested: { deep: { id: unknown } } }).nested.deep.id,
      ).toBe("deep-id");

      // Other fields should be translated
      expect((data as { name: string }).name).not.toBe("Root Name");
    });

    it("should support multiple disallowed keys", async () => {
      if (skipIfUnavailable()) {
        return;
      }

      const input = {
        id: "user-123",
        name: "John Doe",
        email: "john@example.com",
        countryCode: "US",
        description: "A user",
      };

      const { response, data } = await makeTranslationRequest({
        json: input,
        targetLanguage: TargetLanguage.ZH_TW,
        disallowedTranslateKeys: ["id", "email", "countryCode"],
      });

      expect(response.status).toBe(200);
      expect(data).toBeDefined();

      // Disallowed keys should remain untranslated
      expect((data as { id: unknown }).id).toBe("user-123");
      expect((data as { email: unknown }).email).toBe("john@example.com");
      expect((data as { countryCode: unknown }).countryCode).toBe("US");

      // Allowed keys should be translated
      expect((data as { name: string }).name).not.toBe("John Doe");
      expect((data as { description: string }).description).not.toBe("A user");
    });

    it("should preserve technical fields when disallowed", async () => {
      if (skipIfUnavailable()) {
        return;
      }

      const input = {
        uuid: "550e8400-e29b-41d4-a716-446655440000",
        sku: "PROD-12345",
        slug: "product-name",
        version: "1.0.0",
        checksum: "abc123",
        name: "Product Name",
      };

      const { response, data } = await makeTranslationRequest({
        json: input,
        targetLanguage: TargetLanguage.ZH_TW,
        disallowedTranslateKeys: ["uuid", "sku", "slug", "version", "checksum"],
      });

      expect(response.status).toBe(200);
      expect(data).toBeDefined();

      // Technical fields should be preserved
      expect((data as { uuid: unknown }).uuid).toBe(
        "550e8400-e29b-41d4-a716-446655440000",
      );
      expect((data as { sku: unknown }).sku).toBe("PROD-12345");
      expect((data as { slug: unknown }).slug).toBe("product-name");
      expect((data as { version: unknown }).version).toBe("1.0.0");
      expect((data as { checksum: unknown }).checksum).toBe("abc123");

      // name should be translated
      expect((data as { name: string }).name).not.toBe("Product Name");
    });

    it("should preserve metadata fields when disallowed", async () => {
      if (skipIfUnavailable()) {
        return;
      }

      const input = {
        id: "123",
        name: "Item Name",
        createdAt: "2024-01-15T10:30:00Z",
        updatedAt: "2024-01-16T14:20:00Z",
      };

      const { response, data } = await makeTranslationRequest({
        json: input,
        targetLanguage: TargetLanguage.ZH_TW,
        disallowedTranslateKeys: ["id", "createdAt", "updatedAt"],
      });

      expect(response.status).toBe(200);
      expect(data).toBeDefined();

      // Metadata fields should be preserved
      expect((data as { id: unknown }).id).toBe("123");
      expect((data as { createdAt: unknown }).createdAt).toBe(
        "2024-01-15T10:30:00Z",
      );
      expect((data as { updatedAt: unknown }).updatedAt).toBe(
        "2024-01-16T14:20:00Z",
      );

      // name should be translated
      expect((data as { name: string }).name).not.toBe("Item Name");
    });
  });

  describe("Special Conditions and Edge Cases", () => {
    it("should pass through empty strings unchanged", async () => {
      if (skipIfUnavailable()) {
        return;
      }

      const input = { name: "Hello World", empty: "" };

      const { response, data } = await makeTranslationRequest({
        json: input,
        targetLanguage: TargetLanguage.ZH_TW,
      });

      expect(response.status).toBe(200);
      expect(data).toBeDefined();

      // Empty string should be preserved
      expect((data as { empty: unknown }).empty).toBe("");

      // name should be translated
      expect((data as { name: string }).name).not.toBe("Hello World");
    });

    it("should pass through whitespace-only strings unchanged", async () => {
      if (skipIfUnavailable()) {
        return;
      }

      const input = { name: "Hello World", whitespace: "   " };

      const { response, data } = await makeTranslationRequest({
        json: input,
        targetLanguage: TargetLanguage.ZH_TW,
      });

      expect(response.status).toBe(200);
      expect(data).toBeDefined();

      // Whitespace-only string should be preserved
      expect((data as { whitespace: unknown }).whitespace).toBe("   ");
    });

    it("should pass through escape sequence strings unchanged", async () => {
      if (skipIfUnavailable()) {
        return;
      }

      const input = { name: "Hello World", escapes: "\n\t" };

      const { response, data } = await makeTranslationRequest({
        json: input,
        targetLanguage: TargetLanguage.ZH_TW,
      });

      expect(response.status).toBe(200);
      expect(data).toBeDefined();

      // Escape sequence-only string should be preserved
      expect((data as { escapes: unknown }).escapes).toBe("\n\t");
    });

    it("should handle mixed arrays with various types", async () => {
      if (skipIfUnavailable()) {
        return;
      }

      const input = {
        items: ["Text to translate", 123, null, { nested: "More text" }, true],
      };

      const { response, data } = await makeTranslationRequest({
        json: input,
        targetLanguage: TargetLanguage.ZH_TW,
      });

      expect(response.status).toBe(200);
      expect(data).toBeDefined();
      expect(haveSamePaths(input, data)).toBe(true);
      expect(haveSameTypes(input, data)).toBe(true);
    });

    it("should preserve escape sequences in translatable text", async () => {
      if (skipIfUnavailable()) {
        return;
      }

      const input = {
        lineBreaks: "Line 1\nLine 2",
        tabs: "Tab\there",
        quotes: 'Quote: "text"',
      };

      const { response, data } = await makeTranslationRequest({
        json: input,
        targetLanguage: TargetLanguage.ZH_TW,
      });

      expect(response.status).toBe(200);
      expect(data).toBeDefined();

      // Verify the escape sequences are preserved in the output
      const lineBreaksResult = (data as { lineBreaks: string }).lineBreaks;
      const tabsResult = (data as { tabs: string }).tabs;
      const quotesResult = (data as { quotes: string }).quotes;

      // Text should be translated but escape sequences preserved
      expect(lineBreaksResult).not.toBe("Line 1\nLine 2");
      expect(lineBreaksResult).toContain("\n");
      expect(tabsResult).not.toBe("Tab\there");
      expect(tabsResult).toContain("\t");
      expect(quotesResult).not.toBe('Quote: "text"');
      expect(quotesResult).toContain('"');
    });

    it("should handle empty objects", async () => {
      if (skipIfUnavailable()) {
        return;
      }

      const input = {};

      const { response, data } = await makeTranslationRequest({
        json: input,
        targetLanguage: TargetLanguage.ZH_TW,
      });

      expect(response.status).toBe(200);
      expect(data).toEqual({});
    });

    it("should handle unicode characters", async () => {
      if (skipIfUnavailable()) {
        return;
      }

      const input = {
        chinese: "你好世界",
        japanese: "こんにちは世界",
        emoji: "Hello 👋 World",
      };

      const { response, data } = await makeTranslationRequest({
        json: input,
        targetLanguage: TargetLanguage.EN_US,
      });

      expect(response.status).toBe(200);
      expect(data).toBeDefined();
      expect(haveSamePaths(input, data)).toBe(true);
      expect(haveSameTypes(input, data)).toBe(true);
    });

    it("should handle empty arrays", async () => {
      if (skipIfUnavailable()) {
        return;
      }

      const input = {
        items: [],
        name: "Test",
      };

      const { response, data } = await makeTranslationRequest({
        json: input,
        targetLanguage: TargetLanguage.ZH_TW,
      });

      expect(response.status).toBe(200);
      expect(data).toBeDefined();
      expect((data as { items: unknown[] }).items).toEqual([]);
    });
  });

  describe("Error Handling", () => {
    it("should return 400 for invalid Content-Type", async () => {
      if (skipIfUnavailable()) {
        return;
      }

      const input = { name: "Test" };

      const { response } = await makeTranslationRequest(
        { json: input, targetLanguage: TargetLanguage.ZH_TW },
        { "Content-Type": "text/plain" },
      );

      expect(response.status).toBe(400);
    });

    it("should return 400 for invalid JSON body", async () => {
      if (skipIfUnavailable()) {
        return;
      }

      const response = await fetch(`${API_BASE_URL}/translate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${APP_API_KEY}`,
        },
        body: "not valid json",
      });

      expect(response.status).toBe(400);
    });

    it("should return 400 for invalid json field type", async () => {
      if (skipIfUnavailable()) {
        return;
      }

      const { response } = await makeTranslationRequest({
        json: "not an object" as unknown as object,
        targetLanguage: TargetLanguage.ZH_TW,
      });

      expect(response.status).toBe(400);
    });

    it("should return 400 for invalid targetLanguage", async () => {
      if (skipIfUnavailable()) {
        return;
      }

      const input = { name: "Test" };

      const { response } = await makeTranslationRequest({
        json: input,
        targetLanguage: "invalid-language" as TargetLanguage,
      });

      expect(response.status).toBe(400);
    });

    it("should return 401 for missing Authorization", async () => {
      if (skipIfUnavailable()) {
        return;
      }

      const input = { name: "Test" };

      const response = await fetch(`${API_BASE_URL}/translate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          json: input,
          targetLanguage: TargetLanguage.ZH_TW,
        }),
      });

      expect(response.status).toBe(401);
    });

    it("should return 401 for invalid Authorization", async () => {
      if (skipIfUnavailable()) {
        return;
      }

      const input = { name: "Test" };

      const { response } = await makeTranslationRequest(
        { json: input, targetLanguage: TargetLanguage.ZH_TW },
        { Authorization: "Bearer invalid-key" },
      );

      expect(response.status).toBe(401);
    });
  });
});
