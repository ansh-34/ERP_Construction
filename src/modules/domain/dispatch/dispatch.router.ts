import { Router } from 'express';
// import authorize from '../../../middlewares/authorize.js';
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
router.get('/stats', /* authorize('dispatch', 'read'), */ getDispatchStats);

// list
router.get(
  '/',
  // authorize('dispatch', 'read'),
  validate(listDispatchesQuerySchema, 'query'),
  listDispatches,
);

// create
router.post(
  '/',
  // authorize('dispatch', 'create'),
  validate(createDispatchBodySchema, 'body'),
  createDispatch,
);

export default router;
