import { Router } from 'express';
import validateSuperadmin from '../../../middlewares/validateSuperadmin.js';
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

router.use(validateSuperadmin);

router.post(
  '/entry',
  validate(createModuleDependencyBodySchema, 'body'),
  createModuleDependency,
);
router.get(
  '/list',
  validate(listModuleDependenciesQuerySchema, 'query'),
  listModuleDependencies,
);
router.delete(
  '/:id',
  validate(moduleDependencyIdParamsSchema, 'params'),
  deleteModuleDependency,
);

export default router;
