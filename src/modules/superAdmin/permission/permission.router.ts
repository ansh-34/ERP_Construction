import { Router } from 'express';
import validateSuperadmin from '../../../middlewares/validateSuperadmin.js';
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

router.use(validateSuperadmin);

router.post(
  '/entry',
  validate(createPermissionBodySchema, 'body'),
  createPermission,
);
router.get(
  '/list',
  validate(listPermissionsQuerySchema, 'query'),
  listPermissions,
);
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
