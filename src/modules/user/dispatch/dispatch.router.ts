import { Router } from 'express';
import authorize from '../../../middlewares/authorize.js';
import { validate } from '../../../middlewares/validate.js';
import {
  getDispatchStats,
  createDispatch,
  listDispatches,
} from './dispatch.controller.js';
import {
  createDispatchBodySchema,
  listDispatchesQuerySchema,
} from './dispatch.validator.js';

const router = Router();

// stats
router.get('/stats', authorize('DISPATCH', 'READ'), getDispatchStats);

// list
router.get(
  '/',
  authorize('DISPATCH', 'READ'),
  validate(listDispatchesQuerySchema, 'query'),
  listDispatches,
);

// create
router.post(
  '/',
  authorize('DISPATCH', 'CREATE'),
  validate(createDispatchBodySchema, 'body'),
  createDispatch,
);

export default router;
