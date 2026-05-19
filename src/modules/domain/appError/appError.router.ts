import { Router } from 'express';
import { validate } from '../../../middlewares/validate.js';
import { createAppError, listAppErrors } from './appError.controller.js';
import {
  createAppErrorBodySchema,
  listAppErrorsQuerySchema,
} from './appError.validator.js';

const router = Router();

router.post('/', validate(createAppErrorBodySchema, 'body'), createAppError);
router.get('/', validate(listAppErrorsQuerySchema, 'query'), listAppErrors);

export default router;
