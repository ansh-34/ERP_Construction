import { Router } from 'express';
import { validate } from '../../../middlewares/validate.js';
import { getLanguage, listLanguages } from './language.controller.js';
import {
  languageIdParamsSchema,
  listLanguagesQuerySchema,
} from './language.validator.js';

const router = Router();

router.get('/', validate(listLanguagesQuerySchema, 'query'), listLanguages);
router.get('/:id', validate(languageIdParamsSchema, 'params'), getLanguage);

export default router;
