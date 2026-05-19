import { Router } from 'express';
import { validate } from '../../../middlewares/validate.js';
import { listUsers, inviteUser } from './user.controller.js';
import {
  inviteUserBodySchema,
  listUsersQuerySchema,
} from './user.validator.js';

const router = Router();

// Protected routes
router.post(
  '/invite',
  validate(inviteUserBodySchema, 'body'),
  inviteUser,
);
router.get(
  '/',
  validate(listUsersQuerySchema, 'query'),
  listUsers,
);

export default router;
