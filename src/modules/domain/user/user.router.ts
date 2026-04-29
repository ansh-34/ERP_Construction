import { Router } from 'express';
import authMiddleware from '../../../middlewares/auth.js';
import { validate } from '../../../middlewares/validate.js';
import {
  listUsers,
  inviteUser,
  verifyAndActivateUser,
  registerUser,
  loginUser,
} from './user.controller.js';
import isAdmin from '../../../middlewares/isAdmin.js';
import {
  inviteUserBodySchema,
  listUsersQuerySchema,
  loginUserBodySchema,
  registerUserBodySchema,
  verifyAndActivateUserBodySchema,
} from './user.validator.js';

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

// Protected routes
router.post(
  '/invite',
  authMiddleware,
  isAdmin,
  validate(inviteUserBodySchema, 'body'),
  inviteUser,
);
router.get(
  '/list',
  authMiddleware,
  isAdmin,
  validate(listUsersQuerySchema, 'query'),
  listUsers,
);

export default router;
