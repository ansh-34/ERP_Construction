import { Router } from 'express';
import authMiddleware from '../../../middlewares/auth.js';
import { validate } from '../../../middlewares/validate.js';
import {
  verifyAndActivateUser,
  registerUser,
  loginUser,
} from './auth.controller.js';
import isAdmin from '../../../middlewares/isAdmin.js';
import {
  listUsersQuerySchema,
  loginUserBodySchema,
  registerUserBodySchema,
  verifyAndActivateUserBodySchema,
} from './auth.validator.js';

const router = Router();

// Public routes
router.post(
  '/verify',
  validate(verifyAndActivateUserBodySchema, 'body'),
  verifyAndActivateUser,
);
router.post(
  '/register',
  authMiddleware,
  validate(registerUserBodySchema, 'body'),
  registerUser,
);
router.post('/login', validate(loginUserBodySchema, 'body'), loginUser);

export default router;
