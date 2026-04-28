import crypto from 'node:crypto';

export function generateCode(prefix: string): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();

  return `${prefix}_${timestamp}_${random}`;
}

export function generateSecret(): string {
  return crypto.randomBytes(32).toString('hex');
}
