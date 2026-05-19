import { Router } from 'express';
import { validate } from '../../../middlewares/validate.js';
import { listModules, getModule } from './module.controller.js';
import {
  listModulesQuerySchema,
  moduleIdParamsSchema,
} from './module.validator.js';

const router = Router();


router.get('/', validate(listModulesQuerySchema, 'query'), listModules);
router.get('/:id', validate(moduleIdParamsSchema, 'params'), getModule);

export default router;
