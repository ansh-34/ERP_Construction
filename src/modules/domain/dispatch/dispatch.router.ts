import { Router } from 'express';
import authMiddleware from '../../../middlewares/auth.js';
import authorize from '../../../middlewares/authorize.js';
import { validate } from '../../../middlewares/validate.js';
import { createDispatch, listDispatches } from './dispatch.controller.js';
import {
  createDispatchBodySchema,
  listDispatchesQuerySchema,
} from './dispatch.validator.js';

const router = Router();

router.use(authMiddleware);

router.post(
  '/entry',
  authorize('dispatch', 'create'),
  validate(createDispatchBodySchema, 'body'),
  createDispatch,
);
router.get(
  '/list',
  authorize('dispatch', 'read'),
  validate(listDispatchesQuerySchema, 'query'),
  listDispatches,
);

export default router;
