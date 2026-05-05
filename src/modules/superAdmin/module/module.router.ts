import { Router } from 'express';
import validateSuperAdmin from '../../../middlewares/validateSuperAdmin.js';
import { validate } from '../../../middlewares/validate.js';
import {
  createModule,
  listModules,
  updateModule,
  deleteModule,
  getModule,
} from './module.controller.js';
import {
  createModuleBodySchema,
  listModulesQuerySchema,
  moduleIdParamsSchema,
  updateModuleBodySchema,
} from './module.validator.js';

const router = Router();

router.use(validateSuperAdmin);

router.post('/', validate(createModuleBodySchema, 'body'), createModule);
router.get('/', validate(listModulesQuerySchema, 'query'), listModules);
router.get('/:id', validate(moduleIdParamsSchema, 'params'), getModule);
router.put(
  '/:id',
  validate(moduleIdParamsSchema, 'params'),
  validate(updateModuleBodySchema, 'body'),
  updateModule,
);
router.delete('/:id', validate(moduleIdParamsSchema, 'params'), deleteModule);

export default router;
