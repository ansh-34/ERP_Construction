import { Router } from 'express';
import authorize from '../../../middlewares/authorize.js';
import { validate } from '../../../middlewares/validate.js';
import {
  createRole,
  assignPermissions,
  listRoles,
  getRoleById,
  updateRole,
  deleteRole,
  assignRole,
} from './role.controller.js';
import {
  assignPermissionsBodySchema,
  assignPermissionsParamsSchema,
  assignRoleBodySchema,
  assignRoleParamsSchema,
  createRoleBodySchema,
  updateRoleBodySchema,
  listRolesQuerySchema,
  roleIdParamsSchema,
} from './role.validator.js';

const router = Router();

router.post(
  '/',
  authorize('ROLE', 'CREATE'),
  validate(createRoleBodySchema, 'body'),
  createRole,
);
router.get(
  '/',
  authorize('ROLE', 'READ'),
  validate(listRolesQuerySchema, 'query'),
  listRoles,
);
router.get(
  '/:id',
  authorize('ROLE', 'READ'),
  validate(roleIdParamsSchema, 'params'),
  getRoleById,
);
router.put(
  '/:id',
  authorize('ROLE', 'UPDATE'),
  validate(roleIdParamsSchema, 'params'),
  validate(updateRoleBodySchema, 'body'),
  updateRole,
);
router.delete(
  '/:id',
  authorize('ROLE', 'DELETE'),
  validate(roleIdParamsSchema, 'params'),
  deleteRole,
);
router.post(
  '/:roleId/permissions',
  authorize('ROLE', 'UPDATE'),
  validate(assignPermissionsParamsSchema, 'params'),
  validate(assignPermissionsBodySchema, 'body'),
  assignPermissions,
);
router.post(
  '/:id/role',
  authorize('ROLE', 'UPDATE'),
  validate(assignRoleParamsSchema, 'params'),
  validate(assignRoleBodySchema, 'body'),
  assignRole,
);

export default router;
