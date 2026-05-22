export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function isPlainObject(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

export function isNonNegativeFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

export function isPositiveFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

/** Maps validator `active`/`inactive` (or `ACTIVE`/`INACTIVE`) to Prisma StatusEnum. */
export function normalizeStatus(
  status?: string | null,
  fallback: 'ACTIVE' | 'INACTIVE' = 'ACTIVE',
): 'ACTIVE' | 'INACTIVE' {
  if (!status) return fallback;
  const upper = status.toString().trim().toUpperCase();
  if (upper === 'ACTIVE' || upper === 'INACTIVE') return upper;
  return fallback;
}
