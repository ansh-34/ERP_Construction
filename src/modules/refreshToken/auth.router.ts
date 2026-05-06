import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import { refreshToken } from './auth.controller.js';
import { refreshTokenSchema } from './auth.validator.js';

const router = Router();

router.post(
  '/refresh-token',
  validate(refreshTokenSchema, 'body'),
  refreshToken,
);

export default router;
