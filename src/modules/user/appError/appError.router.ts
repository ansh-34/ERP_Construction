import { Router } from 'express';
import authorize from '../../../middlewares/authorize.js';
import { validate } from '../../../middlewares/validate.js';
import { createAppError, listAppErrors } from './appError.controller.js';
import {
  createAppErrorBodySchema,
  listAppErrorsQuerySchema,
} from './appError.validator.js';

const router = Router();

router.post(
  '/',
  authorize('APP_ERROR', 'CREATE'),
  validate(createAppErrorBodySchema, 'body'),
  createAppError,
);
router.get(
  '/',
  authorize('APP_ERROR', 'READ'),
  validate(listAppErrorsQuerySchema, 'query'),
  listAppErrors,
);

export default router;
