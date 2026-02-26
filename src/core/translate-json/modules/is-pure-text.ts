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
  isLocale, // Checks if the string is a valid locale
  isMobilePhone, // Checks if the string is a mobile phone number.
  isMongoId,
  isNumberString, // Checks if the string is a valid hex-encoded representation of a MongoDB ObjectId.
  isURL, // Checks if the string is an url.
  isUUID, // Checks if the string is a UUID (version 3, 4 or 5).
} from "class-validator";
import type { MobilePhoneLocale } from "validator";

export function isPureText(value: string): boolean {
  const isMobilePhoneInAllLocales = (value: string): boolean => {
    const locales: MobilePhoneLocale[] = [
      "ar-AE",
      "ar-BH",
      "ar-DZ",
      "ar-EG",
      "ar-IQ",
      "ar-JO",
      "ar-KW",
      "ar-SA",
      "ar-SY",
      "ar-TN",
      "be-BY",
      "bg-BG",
      "bn-BD",
      "cs-CZ",
      "da-DK",
      "de-DE",
      "de-AT",
      "el-GR",
      "en-AU",
      "en-CA",
      "en-GB",
      "en-GG",
      "en-GH",
      "en-HK",
      "en-MO",
      "en-IE",
      "en-IN",
      "en-KE",
      "en-MT",
      "en-MU",
      "en-NG",
      "en-NZ",
      "en-PK",
      "en-RW",
      "en-SG",
      "en-SL",
      "en-UG",
      "en-US",
      "en-TZ",
      "en-ZA",
      "en-ZM",
      "es-CL",
      "es-CR",
      "es-EC",
      "es-ES",
      "es-MX",
      "es-PA",
      "es-PY",
      "es-UY",
      "et-EE",
      "fa-IR",
      "fi-FI",
      "fj-FJ",
      "fo-FO",
      "fr-BE",
      "fr-FR",
      "fr-GF",
      "fr-GP",
      "fr-MQ",
      "fr-RE",
      "he-IL",
      "hu-HU",
      "id-ID",
      "it-IT",
      "ja-JP",
      "kk-KZ",
      "kl-GL",
      "ko-KR",
      "lt-LT",
      "ms-MY",
      "nb-NO",
      "ne-NP",
      "nl-BE",
      "nl-NL",
      "nn-NO",
      "pl-PL",
      "pt-BR",
      "pt-PT",
      "ro-RO",
      "ru-RU",
      "sl-SI",
      "sk-SK",
      "sr-RS",
      "sv-SE",
      "th-TH",
      "tr-TR",
      "uk-UA",
      "vi-VN",
      "zh-CN",
      "zh-HK",
      "zh-MO",
      "zh-TW",
    ];

    return locales.some((locale) => isMobilePhone(value, locale));
  };

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
      isMobilePhoneInAllLocales(value) ||
      isMongoId(value) ||
      isNumberString(value) ||
      isURL(value) ||
      isUUID(value, 3) ||
      isUUID(value, 4) ||
      isUUID(value, 5) ||
      isLocale(value)
    )
  );
}
