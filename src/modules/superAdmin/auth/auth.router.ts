import { Router } from 'express';
import { validate } from '../../../middlewares/validate.js';
import { loginSuperAdmin, refreshToken } from './auth.controller.js';
import {
  refreshTokenSchema,
  superAdminLoginBodySchema,
} from './auth.validator.js';

const router = Router();

router.post(
  '/login',
  validate(superAdminLoginBodySchema, 'body'),
  loginSuperAdmin,
);

router.post(
  '/refresh-token',
  validate(refreshTokenSchema, 'body'),
  refreshToken,
);

export default router;
