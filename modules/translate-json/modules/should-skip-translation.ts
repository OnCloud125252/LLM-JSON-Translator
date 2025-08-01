export function shouldSkipTranslation(
  key: string,
  disallowedTranslateKeys?: string[],
): boolean {
  return !disallowedTranslateKeys.includes(key);
}
