import rateLimit from 'express-rate-limit';
import { Messages } from '@constants/index.js';
import dotenv from 'dotenv';

dotenv.config();

export const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  message: {
    success: false,
    message: Messages.COMMON.TOO_MANY_REQUESTS,
  },
});
