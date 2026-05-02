import { Router } from 'express';
import validateSuperAdmin from '../../../middlewares/validateSuperAdmin.js';
import { validate } from '../../../middlewares/validate.js';
import {
  createModuleDependency,
  listModuleDependencies,
  deleteModuleDependency,
} from './moduleDependency.controller.js';
import {
  createModuleDependencyBodySchema,
  listModuleDependenciesQuerySchema,
  moduleDependencyIdParamsSchema,
} from './moduleDependency.validator.js';

const router = Router();

router.use(validateSuperAdmin);

router.post(
  '/',
  validate(createModuleDependencyBodySchema, 'body'),
  createModuleDependency,
);
router.get(
  '/',
  validate(listModuleDependenciesQuerySchema, 'query'),
  listModuleDependencies,
);
router.delete(
  '/:id',
  validate(moduleDependencyIdParamsSchema, 'params'),
  deleteModuleDependency,
);

export default router;
