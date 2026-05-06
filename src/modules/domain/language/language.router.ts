import { Router } from 'express';
import authMiddleware from '../../../middlewares/auth.js';
import { validate } from '../../../middlewares/validate.js';
import { createLanguage, listLanguages } from './language.controller.js';
import {
  createLanguageBodySchema,
  listLanguagesQuerySchema,
} from './language.validator.js';

const router = Router();

router.get(
  '/',
  authMiddleware,
  validate(listLanguagesQuerySchema, 'query'),
  listLanguages,
);
router.post(
  '/',
  authMiddleware,
  validate(createLanguageBodySchema, 'body'),
  createLanguage,
);
export default router;
