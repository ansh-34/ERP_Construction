import { Router } from 'express';
import { validate } from '../../../middlewares/validate.js';
import { listLanguages, getLanguage } from './language.controller.js';
import {
  listLanguagesQuerySchema,
  languageIdParamsSchema,
} from './language.validator.js';
import authMiddleware from '../../../middlewares/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/', validate(listLanguagesQuerySchema, 'query'), listLanguages);
router.get('/:id', validate(languageIdParamsSchema, 'params'), getLanguage);

export default router;
