import { Router } from 'express';
import authMiddleware from '../../../middlewares/auth.js';
import { validate } from '../../../middlewares/validate.js';
import { listUsers, inviteUser } from './user.controller.js';
import isAdmin from '../../../middlewares/isAdmin.js';
import {
  inviteUserBodySchema,
  listUsersQuerySchema,
} from './user.validator.js';

const router = Router();

// Protected routes
router.post(
  '/invite',
  authMiddleware,
  isAdmin,
  validate(inviteUserBodySchema, 'body'),
  inviteUser,
);
router.get(
  '/',
  authMiddleware,
  isAdmin,
  validate(listUsersQuerySchema, 'query'),
  listUsers,
);

export default router;
