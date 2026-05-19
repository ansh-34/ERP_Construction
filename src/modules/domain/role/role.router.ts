import { Router } from 'express';
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


router.post('/', validate(createRoleBodySchema, 'body'), createRole);
router.get('/', validate(listRolesQuerySchema, 'query'), listRoles);
router.get(
  '/:id',
  validate(roleIdParamsSchema, 'params'),
  getRoleById,
);
router.put(
  '/:id',
  validate(roleIdParamsSchema, 'params'),
  validate(updateRoleBodySchema, 'body'),
  updateRole,
);
router.delete(
  '/:id',
  validate(roleIdParamsSchema, 'params'),
  deleteRole,
);
router.post(
  '/:roleId/permissions',
  validate(assignPermissionsParamsSchema, 'params'),
  validate(assignPermissionsBodySchema, 'body'),
  assignPermissions,
);
router.post(
  '/:id/role',
  validate(assignRoleParamsSchema, 'params'),
  validate(assignRoleBodySchema, 'body'),
  assignRole,
);

export default router;
