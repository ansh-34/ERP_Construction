import { Router } from 'express';
import authMiddleware from '../../../middlewares/auth.js';
import { validate } from '../../../middlewares/validate.js';
import { getLanguage, listLanguages } from './language.controller.js';
import {
  languageIdParamsSchema,
  listLanguagesQuerySchema,
} from './language.validator.js';

const router = Router();

router.use(authMiddleware);

router.get('/', validate(listLanguagesQuerySchema, 'query'), listLanguages);
router.get('/:id', validate(languageIdParamsSchema, 'params'), getLanguage);

export default router;