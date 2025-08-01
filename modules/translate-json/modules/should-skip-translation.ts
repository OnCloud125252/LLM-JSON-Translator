export function shouldSkipTranslation(
  key: string,
  disallowedTranslateKeys?: string[],
): boolean {
  if (!disallowedTranslateKeys) {
    return false;
  }

  return disallowedTranslateKeys.includes(key);
}
