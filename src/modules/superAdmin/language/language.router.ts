import { Router } from 'express';
import { validate } from '../../../middlewares/validate.js';
import {
  createLanguage,
  listLanguages,
  updateLanguage,
  deleteLanguage,
} from './language.controller.js';
import {
  createLanguageBodySchema,
  listLanguagesQuerySchema,
  languageIdParamsSchema,
  updateLanguageBodySchema,
} from './language.validator.js';
import validateSuperAdmin from '@/middlewares/validateSuperAdmin.js';

const router = Router();

router.use(validateSuperAdmin);

router.post('/', validate(createLanguageBodySchema, 'body'), createLanguage);

router.get('/', validate(listLanguagesQuerySchema, 'query'), listLanguages);

router.put(
  '/:id',
  validate(languageIdParamsSchema, 'params'),
  validate(updateLanguageBodySchema, 'body'),
  updateLanguage,
);

router.delete(
  '/:id',
  validate(languageIdParamsSchema, 'params'),
  deleteLanguage,
);

export default router;
