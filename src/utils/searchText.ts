function flattenSearchValue(value: unknown): string[] {
  if (value === null || value === undefined) {
    return [];
  }

  if (typeof value === 'string') {
    return [value];
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return [String(value)];
  }

  if (Array.isArray(value)) {
    return value.flatMap(flattenSearchValue);
  }

  if (typeof value === 'object') {
    return Object.values(value as Record<string, unknown>).flatMap(
      flattenSearchValue,
    );
  }

  return [];
}

export function buildSearchText(...values: unknown[]): string {
  return values.flatMap(flattenSearchValue).join(' ').toLowerCase();
}
