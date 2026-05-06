import { Router } from 'express';
import validateSuperAdmin from '../../../middlewares/validateSuperAdmin.js';
import { validate } from '../../../middlewares/validate.js';
import {
  createModulePermissions,
  listModulePermissions,
  deleteModulePermissions,
} from './modulePermission.controller.js';
import {
  listModulePermissionsQuerySchema,
  modulePermissionIdParamsSchema,
  setModulePermissionsBodySchema,
} from './modulePermission.validator.js';

const router = Router();

router.use(validateSuperAdmin);

router.post(
  '/',
  validate(setModulePermissionsBodySchema, 'body'),
  createModulePermissions,
);
router.get(
  '/',
  validate(listModulePermissionsQuerySchema, 'query'),
  listModulePermissions,
);
router.delete(
  '/:id',
  validate(modulePermissionIdParamsSchema, 'params'),
  deleteModulePermissions,
);

export default router;
