import { Router } from 'express';
import authorize from '../../../middlewares/authorize.js';
import { validate } from '../../../middlewares/validate.js';
import { listUsers } from './user.controller.js';
import { listUsersQuerySchema } from './user.validator.js';

const router = Router();

router.get(
  '/',
  authorize('USER', 'READ'),
  validate(listUsersQuerySchema, 'query'),
  listUsers,
);

export default router;
