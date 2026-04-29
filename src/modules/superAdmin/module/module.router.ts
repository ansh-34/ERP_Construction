import { Router } from 'express';
import validateSuperadmin from '../../../middlewares/validateSuperadmin.js';
import { validate } from '../../../middlewares/validate.js';
import {
  createModule,
  listModules,
  updateModule,
  deleteModule,
} from './module.controller.js';
import {
  createModuleBodySchema,
  moduleIdParamsSchema,
  updateModuleBodySchema,
} from './module.validator.js';

const router = Router();

router.use(validateSuperadmin);

router.post('/create', validate(createModuleBodySchema, 'body'), createModule);
router.get('/list', listModules);
router.post(
  '/:id',
  validate(moduleIdParamsSchema, 'params'),
  validate(updateModuleBodySchema, 'body'),
  updateModule,
);
router.delete('/:id', validate(moduleIdParamsSchema, 'params'), deleteModule);

export default router;
