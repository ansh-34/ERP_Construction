import crypto from 'crypto';
import { variables } from '@config/index';

export function encrypt(text: string) {
  const IV = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    variables.ENCRYPTION_METHOD,
    variables.ENCRYPTION_KEY,
    IV,
  );
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex') + '.' + IV.toString('hex');
  return encrypted;
}

export function decrypt(encrypted: string) {
  const IV = Buffer.from(encrypted.split('.')[1], 'hex');
  const decipher = crypto.createDecipheriv(
    variables.ENCRYPTION_METHOD,
    variables.ENCRYPTION_KEY,
    IV,
  );
  let decrypted = decipher.update(encrypted.split('.')[0], 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
