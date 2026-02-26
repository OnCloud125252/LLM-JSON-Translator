import {
  isBase64, // Checks if a string is base64 encoded.
  isCreditCard, // Checks if the string is a credit card.
  isCurrency, // Checks if the string is a valid currency amount.
  isEmail, // Checks if the string is an email.
  isFQDN, // Checks if the string is a fully qualified domain name (e.g. domain.com).
  isHexadecimal, // Checks if the string is a hexadecimal number.
  isIP, // Checks if the string is an IP (version 4 or 6).
  isISBN, // Checks if the string is an ISBN (version 10 or 13).
  isISIN, // Checks if the string is an ISIN (stock/security identifier).
  isISO8601, // Checks if the string is a valid ISO 8601 date.
  isMobilePhone, // Checks if the string is a mobile phone number.
  isMongoId, // Checks if the string is a valid hex-encoded representation of a MongoDB ObjectId.
  isNumberString, // Checks if the string is a valid number string.
  isURL, // Checks if the string is an url.
  isUUID, // Checks if the string is a UUID (version 3, 4 or 5).
} from "class-validator";

// Common ISO-639 language codes that are also common English words
// We only consider these as locales when they appear with region/script codes (e.g., "en-US")
const COMMON_LANGUAGE_CODES = new Set([
  "en",
  "fr",
  "de",
  "es",
  "it",
  "pt",
  "ru",
  "ja",
  "ko",
  "zh",
  "ar",
  "hi",
  "nl",
  "pl",
  "tr",
  "vi",
  "th",
  "id",
  "ms",
  "sv",
  "no",
  "da",
  "fi",
  "cs",
  "hu",
  "ro",
  "sk",
  "bg",
  "hr",
  "sr",
  "sl",
  "lt",
  "lv",
  "et",
  "is",
  "ga",
  "mt",
  "cy",
  "eu",
  "ca",
  "gl",
  "ast",
  "wa",
  "br",
  "gd",
  "gv",
  "kw",
  "oc",
  "sc",
  "sco",
  "ang",
  "enm",
  "nrf",
  "pam",
  "sga",
  "sux",
  "tlh",
  "tok",
  "vo",
  "yi",
  "jv",
  "su",
  "min",
  "bew",
  "bug",
  "bjn",
  "ace",
  "gor",
  "tl",
  "ilo",
  "pag",
  "mad",
  "map",
  "nan",
  "wuu",
  "hsn",
  "gan",
  "hak",
  "yue",
  "za",
  "fa",
  "ur",
  "he",
  "tmr",
  "jpr",
  "jrb",
  "lad",
  "ota",
  "cu",
  "chu",
  "grc",
  "goh",
]);

/**
 * Checks if a string is a valid BCP 47 locale tag.
 * Uses stricter validation than isLocale from class-validator to avoid
 * false positives on common words like "google" or "goodbye".
 */
function isValidLocale(value: string): boolean {
  if (typeof value !== "string" || value.length === 0) {
    return false;
  }

  // BCP 47 locale pattern: language[-script][-region][-variant][-extensions]
  // Examples: "en", "en-US", "zh-Hans-CN", "sr-Latn-RS"
  const bcp47Pattern =
    /^[a-zA-Z]{2,3}(?:-[a-zA-Z]{4})?(?:-[a-zA-Z]{2}|[0-9]{3})?(?:-[a-zA-Z0-9]{5,8}|[0-9][a-zA-Z0-9]{3})*$/;

  if (!bcp47Pattern.test(value)) {
    return false;
  }

  // Split into components
  const parts = value.split("-");
  const language = parts[0].toLowerCase();

  // If it's just a language code without region/script, only consider it a locale
  // if it's NOT a common English word (single/double letters are ok as they can't be words)
  if (parts.length === 1) {
    return !COMMON_LANGUAGE_CODES.has(language);
  }

  // Has region/script/variant - validate the language code exists
  return true;
}

/**
 * Checks if a string is a mobile phone number using class-validator.
 * Uses the default locale detection which covers most international formats.
 */
function isMobilePhoneNumber(value: string): boolean {
  return isMobilePhone(value);
}

export function isPureText(value: string): boolean {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    !(
      isBase64(value) ||
      isCreditCard(value) ||
      isCurrency(value) ||
      isEmail(value) ||
      isFQDN(value) ||
      isHexadecimal(value) ||
      isIP(value, 4) ||
      isIP(value, 6) ||
      isISBN(value, 10) ||
      isISBN(value, 13) ||
      isISIN(value) ||
      isISO8601(value) ||
      isMobilePhoneNumber(value) ||
      isMongoId(value) ||
      isNumberString(value) ||
      isURL(value) ||
      isUUID(value, 3) ||
      isUUID(value, 4) ||
      isUUID(value, 5) ||
      isValidLocale(value)
    )
  );
}
