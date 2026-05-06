import crypto from 'crypto';
import variables from '../config/variables.config.js';

if (!variables.ENCRYPTION_KEY) {
  throw new Error(
    'ENCRYPTION_KEY environment variable is required for encryption.',
  );
}

const ENCRYPTION_KEY = crypto
  .createHash('sha256')
  .update(variables.ENCRYPTION_KEY)
  .digest();
const IV_LENGTH = 16; // AES block size
const ENCRYPTION_METHOD = variables.ENCRYPTION_METHOD;

// Encrypt function
export function encrypt(text: string) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ENCRYPTION_METHOD, ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  // prepend IV so we can use it during decryption
  return iv.toString('hex') + ':' + encrypted;
}

// Decrypt function
export function decrypt(encryptedText: string) {
  const [ivHex, encrypted] = encryptedText.split(':');

  const iv = Buffer.from(ivHex, 'hex');

  const decipher = crypto.createDecipheriv(
    ENCRYPTION_METHOD,
    ENCRYPTION_KEY,
    iv,
  );

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
