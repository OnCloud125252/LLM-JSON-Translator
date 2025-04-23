export function isKeyAllowed(key: string): boolean {
  const skippedKeys = ["type", "mapId", "travelMode", "categories", "tags"];

  return !skippedKeys.includes(key);
}
