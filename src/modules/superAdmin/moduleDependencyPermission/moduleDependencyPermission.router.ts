import { Router } from 'express';
import validateSuperAdmin from '../../../middlewares/validateSuperAdmin.js';
import { validate } from '../../../middlewares/validate.js';
import {
  createModuleDependencyPermission,
  deleteModuleDependencyPermission,
} from './moduleDependencyPermission.controller.js';
import {
  createModuleDependencyPermissionBodySchema,
  moduleDependencyPermissionIdParamsSchema,
} from './moduleDependencyPermission.validator.js';

const router = Router();

router.use(validateSuperAdmin);

router.post(
  '/',
  validate(createModuleDependencyPermissionBodySchema, 'body'),
  createModuleDependencyPermission,
);
router.delete(
  '/:id',
  validate(moduleDependencyPermissionIdParamsSchema, 'params'),
  deleteModuleDependencyPermission,
);

export default router;
