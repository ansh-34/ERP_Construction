import { Router } from 'express';
import { validate } from '../../../middlewares/validate.js';
import { listLanguages } from './language.controller.js';
import { listLanguagesQuerySchema } from './language.validator.js';

const router = Router();

router.get('/', validate(listLanguagesQuerySchema, 'query'), listLanguages);

export default router;
