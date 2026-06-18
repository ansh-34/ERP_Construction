const MULTILINGUAL_FIELDS = new Set([
  'displayName',
  'name',
  'gradeDisplayName',
  'organizationType',
  'delayReason',
  'productName',
  'productGradeName',
]);

const SKIP_RECURSE_KEYS = new Set(['password', 'token', 'otp']);

function isMultilingualObject(value: unknown): value is Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  if (value instanceof Date) return false;

  const keys = Object.keys(value);
  if (keys.length === 0) return false;

  return keys.every(
    (k) => /^[a-z]{2,5}$/.test(k) && typeof (value as any)[k] === 'string',
  );
}

export function localizeField(value: any, langCode?: string | null): any {
  if (!langCode) return value;
  if (!value || typeof value !== 'object' || Array.isArray(value)) return value;
  if (value instanceof Date) return value;

  return value[langCode] || value.en || '';
}

export function translateResponse<T>(data: T, langCode?: string | null): T {
  if (!langCode) return data;

  if (Array.isArray(data)) {
    return data.map((item) => translateResponse(item, langCode)) as T;
  }

  if (!data || typeof data !== 'object') return data;
  if (data instanceof Date) return data;

  if (
    typeof (data as any).toJSON === 'function' &&
    !(data as any).constructor?.name?.includes('Object')
  ) {
    return data;
  }

  const result: any = {};

  for (const [key, value] of Object.entries(data as any)) {
    if (SKIP_RECURSE_KEYS.has(key)) {
      result[key] = value;
      continue;
    }

    if (MULTILINGUAL_FIELDS.has(key) && isMultilingualObject(value)) {
      result[key] = localizeField(value, langCode);
    } else if (Array.isArray(value)) {
      result[key] = value.map((item) => translateResponse(item, langCode));
    } else if (value && typeof value === 'object' && !(value instanceof Date)) {
      result[key] = translateResponse(value, langCode);
    } else {
      result[key] = value;
    }
  }

  return result as T;
}
