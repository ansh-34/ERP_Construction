import crypto from 'crypto';

export function generateCode(prefix: string): string {
  const normalizedPrefix = prefix
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '_');
  const suffix = crypto.randomBytes(4).toString('hex').toUpperCase();

  return `${normalizedPrefix}-${suffix}`;
}

export function generateSecret(): string {
  return crypto.randomBytes(32).toString('hex');
}
