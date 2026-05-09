import { Router } from 'express';
import authMiddleware from '../../../middlewares/auth.js';
import { validate } from '../../../middlewares/validate.js';
import {
  verifyAndActivateUser,
  registerUser,
  loginUser,
  refreshToken,
  logout,
  changePassword,
  forgotPassword,
  verifyOtp,
  resetPassword,
} from './auth.controller.js';
import {
  verifyAndActivateUserQuerySchema,
  registerUserBodySchema,
  loginUserBodySchema,
  refreshTokenSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
} from './auth.validator.js';

const router = Router();

// Public routes
router.get(
  '/verify',
  validate(verifyAndActivateUserQuerySchema, 'query'),
  verifyAndActivateUser,
);
router.post(
  '/register',
  authMiddleware,
  validate(registerUserBodySchema, 'body'),
  registerUser,
);
router.post('/login', validate(loginUserBodySchema, 'body'), loginUser);

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
  '/verify-otp',
  validate(verifyOtpSchema, 'body'),
  verifyOtp,
);

router.post(
  '/reset-password',
  validate(resetPasswordSchema, 'body'),
  resetPassword,
);

export default router;
