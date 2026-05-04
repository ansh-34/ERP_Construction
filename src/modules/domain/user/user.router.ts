import { Router } from 'express';
import authMiddleware from '../../../middlewares/auth.js';
import { validate } from '../../../middlewares/validate.js';
import { listUsers, inviteUser } from './user.controller.js';
import isDomain from '../../../middlewares/isDomain.js';
import {
  inviteUserBodySchema,
  listUsersQuerySchema,
} from './user.validator.js';

const router = Router();

// Protected routes
router.post(
  '/invite',
  authMiddleware,
  isDomain,
  validate(inviteUserBodySchema, 'body'),
  inviteUser,
);
router.get(
  '/',
  authMiddleware,
  isDomain,
  validate(listUsersQuerySchema, 'query'),
  listUsers,
);

export default router;
