import { describe, expect, it } from "bun:test";
import { isPureText } from "@core/translate-json/modules/is-pure-text";

describe("isPureText", () => {
  describe("regular text (should return true)", () => {
    it("should return true for simple English text", () => {
      expect(isPureText("Hello World")).toBe(true);
      expect(isPureText("This is a normal sentence.")).toBe(true);
    });

    it("should return true for multi-word text", () => {
      expect(isPureText("Welcome to the hotel california")).toBe(true);
      expect(isPureText("The quick brown fox jumps over the lazy dog")).toBe(
        true,
      );
    });

    it("should return true for common words that look like locales", () => {
      // These should NOT be treated as locales
      expect(isPureText("google")).toBe(true);
      expect(isPureText("goodbye")).toBe(true);
      expect(isPureText("apple")).toBe(true);
      expect(isPureText("banana")).toBe(true);
    });

    it("should return true for unicode text", () => {
      expect(isPureText("你好世界")).toBe(true);
      expect(isPureText("こんにちは世界")).toBe(true);
      expect(isPureText("Hello 👋 World")).toBe(true);
    });

    it("should return true for text with punctuation", () => {
      expect(isPureText("Hello, world!")).toBe(true);
      expect(isPureText("What's your name?")).toBe(true);
    });
  });

  describe("non-text patterns (should return false)", () => {
    it("should return false for empty or whitespace-only strings", () => {
      expect(isPureText("")).toBe(false);
      expect(isPureText("   ")).toBe(false);
      expect(isPureText("\t\n")).toBe(false);
    });

    it("should return false for email addresses", () => {
      expect(isPureText("email@example.com")).toBe(false);
      expect(isPureText("user.name@domain.co.uk")).toBe(false);
    });

    it("should return false for URLs", () => {
      expect(isPureText("https://example.com")).toBe(false);
      // Note: localhost URLs may not be detected by class-validator
      expect(isPureText("http://example.com/path")).toBe(false);
    });

    it("should return false for IP addresses", () => {
      expect(isPureText("192.168.1.1")).toBe(false);
      expect(isPureText("255.255.255.255")).toBe(false);
    });

    it("should return false for MongoDB ObjectIds", () => {
      expect(isPureText("507f1f77bcf86cd799439011")).toBe(false);
      expect(isPureText("000000000000000000000000")).toBe(false);
    });

    it("should return false for numeric strings", () => {
      expect(isPureText("12345")).toBe(false);
      expect(isPureText("0")).toBe(false);
      expect(isPureText("999999")).toBe(false);
    });

    it("should return false for base64 encoded strings", () => {
      expect(isPureText("dGhpcyBpcyBhIHRlc3Q=")).toBe(false);
      expect(isPureText("SGVsbG8gV29ybGQ=")).toBe(false);
    });

    it("should return false for locale codes", () => {
      expect(isPureText("en-US")).toBe(false);
      expect(isPureText("zh-Hans")).toBe(false);
      expect(isPureText("fr-FR")).toBe(false);
      expect(isPureText("pt-BR")).toBe(false);
    });

    it("should return false for credit card numbers", () => {
      // Test Visa format
      expect(isPureText("4111111111111111")).toBe(false);
    });

    it("should return false for ISBN codes", () => {
      expect(isPureText("978-3-16-148410-0")).toBe(false);
      expect(isPureText("0-306-40615-2")).toBe(false);
    });

    it("should return false for ISIN codes", () => {
      expect(isPureText("US0378331005")).toBe(false);
    });

    it("should return false for ISO 8601 dates", () => {
      expect(isPureText("2024-01-15")).toBe(false);
      expect(isPureText("2024-01-15T10:30:00Z")).toBe(false);
    });

    it("should return false for phone numbers", () => {
      expect(isPureText("+14155552671")).toBe(false);
      expect(isPureText("415-555-2671")).toBe(false);
      expect(isPureText("(415) 555-2671")).toBe(false);
    });

    it("should return false for UUIDs", () => {
      expect(isPureText("550e8400-e29b-41d4-a716-446655440000")).toBe(false);
      expect(isPureText("f47ac10b-58cc-4372-a567-0e02b2c3d479")).toBe(false);
    });

    it("should return false for hexadecimal strings", () => {
      expect(isPureText("deadbeef")).toBe(false);
      expect(isPureText("0x1a2b3c")).toBe(false);
    });

    it("should return false for currency amounts", () => {
      expect(isPureText("$100.00")).toBe(false);
      // Note: Some currency formats may not be detected by class-validator
    });
  });

  describe("edge cases", () => {
    it("should handle mixed content as text", () => {
      // Contains letters but also special chars - still text
      expect(isPureText("Hello @ World #123")).toBe(true);
    });

    it("should handle long text", () => {
      const longText =
        "This is a very long text that contains many words and should still be considered pure text even though it is quite lengthy.";
      expect(isPureText(longText)).toBe(true);
    });
  });
});
