import { Router } from 'express';
import authMiddleware from '../../../middlewares/auth.js';
import { validate } from '../../../middlewares/validate.js';
import { createAppError, listAppErrors } from './appError.controller.js';
import {
  createAppErrorBodySchema,
  listAppErrorsQuerySchema,
} from './appError.validator.js';

const router = Router();

// Apply auth middleware to all appError routes
router.use(authMiddleware);

// Endpoint for the mobile app to push errors
router.post('/', validate(createAppErrorBodySchema, 'body'), createAppError);

// Secure endpoint to list errors (requires domain/user authentication)
router.get('/', validate(listAppErrorsQuerySchema, 'query'), listAppErrors);

export default router;
