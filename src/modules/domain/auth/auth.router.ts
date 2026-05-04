import { Router } from 'express';
import authMiddleware from '../../../middlewares/auth.js';
import { validate } from '../../../middlewares/validate.js';
import {
  login,
  refreshToken,
  logout,
  changePassword,
  forgotPassword,
  resetPassword,
} from './auth.controller.js';
import {
  loginBodySchema,
  refreshTokenSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from './auth.validator.js';

const router = Router();

router.post('/login', validate(loginBodySchema, 'body'), login);

router.post(
  '/refresh-token',
  validate(refreshTokenSchema, 'body'),
  refreshToken,
);

router.post('/logout', logout);

router.post(
  '/change-password',
  authMiddleware,
  validate(changePasswordSchema, 'body'),
  changePassword,
);

router.post(
  '/forgot-password',
  validate(forgotPasswordSchema, 'body'),
  forgotPassword,
);

router.post(
  '/reset-password',
  validate(resetPasswordSchema, 'body'),
  resetPassword,
);

export default router;
