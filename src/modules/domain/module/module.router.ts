import { Router } from 'express';
import authMiddleware from '../../../middlewares/auth.js';
import { validate } from '../../../middlewares/validate.js';
import { listModules, getModule } from './module.controller.js';
import {
  listModulesQuerySchema,
  moduleIdParamsSchema,
} from './module.validator.js';

const router = Router();

router.use(authMiddleware);

router.get('/', validate(listModulesQuerySchema, 'query'), listModules);
router.get('/:id', validate(moduleIdParamsSchema, 'params'), getModule);

export default router;
