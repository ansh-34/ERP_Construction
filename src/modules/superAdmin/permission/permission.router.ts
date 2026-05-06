import { Router } from 'express';
import validateSuperAdmin from '../../../middlewares/validateSuperAdmin.js';
import { validate } from '../../../middlewares/validate.js';
import {
  createPermission,
  listPermissions,
  updatePermission,
  deletePermission,
} from './permission.controller.js';
import {
  createPermissionBodySchema,
  listPermissionsQuerySchema,
  permissionIdParamsSchema,
  updatePermissionBodySchema,
} from './permission.validator.js';

const router = Router();

router.use(validateSuperAdmin);

router.post(
  '/',
  validate(createPermissionBodySchema, 'body'),
  createPermission,
);
router.get('/', validate(listPermissionsQuerySchema, 'query'), listPermissions);
router.put(
  '/:id',
  validate(permissionIdParamsSchema, 'params'),
  validate(updatePermissionBodySchema, 'body'),
  updatePermission,
);
router.delete(
  '/:id',
  validate(permissionIdParamsSchema, 'params'),
  deletePermission,
);

export default router;
