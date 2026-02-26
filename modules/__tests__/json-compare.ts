/**
 * Test utilities for comparing JSON structures
 */

/**
 * Gets all paths from a JSON object as an array of path strings.
 * Uses lodash-style path notation: "key", "nested.key", "items[0].name"
 */
export function getAllPaths(obj: unknown, parentPath: string = ""): string[] {
  if (obj === null || typeof obj !== "object") {
    return parentPath ? [parentPath] : [];
  }

  if (Array.isArray(obj)) {
    const paths: string[] = [];
    for (let i = 0; i < obj.length; i++) {
      const newPath = parentPath ? `${parentPath}[${i}]` : `[${i}]`;
      paths.push(...getAllPaths(obj[i], newPath));
    }
    return paths;
  }

  const paths: string[] = [];
  const record = obj as Record<string, unknown>;

  for (const key of Object.keys(record)) {
    const newPath = parentPath ? `${parentPath}.${key}` : key;
    const value = record[key];

    if (value === null || typeof value !== "object") {
      paths.push(newPath);
    } else {
      paths.push(...getAllPaths(value, newPath));
    }
  }

  return paths;
}

/**
 * Gets all paths with their corresponding JavaScript type names.
 * Returns a Record where keys are paths and values are type strings.
 */
export function getPathsWithTypes(
  obj: unknown,
  parentPath: string = "",
): Record<string, string> {
  if (obj === null) {
    return parentPath ? { [parentPath]: "null" } : {};
  }

  if (typeof obj !== "object") {
    return parentPath ? { [parentPath]: typeof obj } : {};
  }

  if (Array.isArray(obj)) {
    const result: Record<string, string> = {};
    for (let i = 0; i < obj.length; i++) {
      const newPath = parentPath ? `${parentPath}[${i}]` : `[${i}]`;
      Object.assign(result, getPathsWithTypes(obj[i], newPath));
    }
    return result;
  }

  const result: Record<string, string> = {};
  const record = obj as Record<string, unknown>;

  for (const key of Object.keys(record)) {
    const newPath = parentPath ? `${parentPath}.${key}` : key;
    const value = record[key];

    if (value === null) {
      result[newPath] = "null";
    } else if (typeof value !== "object") {
      result[newPath] = typeof value;
    } else {
      Object.assign(result, getPathsWithTypes(value, newPath));
    }
  }

  return result;
}

/**
 * Performs deep equality comparison between two values.
 * Returns true if both values have the same structure and primitive values.
 */
export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) {
    return true;
  }

  if (a === null || b === null) {
    return a === b;
  }

  if (typeof a !== "object" || typeof b !== "object") {
    return a === b;
  }

  if (Array.isArray(a) !== Array.isArray(b)) {
    return false;
  }

  if (Array.isArray(a)) {
    if (a.length !== (b as unknown[]).length) {
      return false;
    }
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], (b as unknown[])[i])) {
        return false;
      }
    }
    return true;
  }

  const aKeys = Object.keys(a as object);
  const bKeys = Object.keys(b as object);

  if (aKeys.length !== bKeys.length) {
    return false;
  }

  for (const key of aKeys) {
    if (
      !deepEqual(
        (a as Record<string, unknown>)[key],
        (b as Record<string, unknown>)[key],
      )
    ) {
      return false;
    }
  }

  return true;
}

/**
 * Compares two JSON objects and returns whether they have the same paths.
 */
export function haveSamePaths(a: unknown, b: unknown): boolean {
  const pathsA = getAllPaths(a).sort();
  const pathsB = getAllPaths(b).sort();

  if (pathsA.length !== pathsB.length) {
    return false;
  }

  for (let i = 0; i < pathsA.length; i++) {
    if (pathsA[i] !== pathsB[i]) {
      return false;
    }
  }

  return true;
}

/**
 * Compares two JSON objects and returns whether they have the same types at each path.
 */
export function haveSameTypes(a: unknown, b: unknown): boolean {
  const typesA = getPathsWithTypes(a);
  const typesB = getPathsWithTypes(b);

  const keysA = Object.keys(typesA);
  const keysB = Object.keys(typesB);

  if (keysA.length !== keysB.length) {
    return false;
  }

  for (const key of keysA) {
    if (typesA[key] !== typesB[key]) {
      return false;
    }
  }

  return true;
}
