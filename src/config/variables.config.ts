import dotenv from 'dotenv';
dotenv.config();

const variables = {
  PORT: process.env.PORT || '5000',
  DATABASE_URL: process.env.DATABASE_URL,
  NODE_ENV: process.env.NODE_ENV || 'development',
  BASE_URL:
    process.env.BASE_URL || `http://localhost:${process.env.PORT || '5000'}`,
  MAX_REQUEST_SIZE: process.env.MAX_REQUEST_SIZE || '5mb',

  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRY: process.env.JWT_EXPIRY || '1d',
  SALT_ROUNDS: process.env.SALT_ROUNDS || '12',
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
  ENCRYPTION_METHOD: process.env.ENCRYPTION_METHOD || 'aes-256-cbc',

  SUPERADMIN_NAME: process.env.SUPER_ADMIN_NAME || process.env.SUPERADMIN_NAME,
  SUPERADMIN_EMAIL:
    process.env.SUPER_ADMIN_EMAIL || process.env.SUPERADMIN_EMAIL,
  SUPERADMIN_PASSWORD:
    process.env.SUPER_ADMIN_PASSWORD || process.env.SUPERADMIN_PASSWORD,

  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT || '587',
  SMTP_SECURE: process.env.SMTP_SECURE,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  SMTP_FROM: process.env.SMTP_FROM,

  LOGS_ENABLE: process.env.LOGS_ENABLE || 'false',
};

export default variables;
