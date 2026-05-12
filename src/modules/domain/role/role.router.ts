import { Router } from 'express';
import authMiddleware from '../../../middlewares/auth.js';
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
import isDomain from '../../../middlewares/isDomain.js';
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

router.use(authMiddleware);

router.post('/', isDomain, validate(createRoleBodySchema, 'body'), createRole);
router.get('/', isDomain, validate(listRolesQuerySchema, 'query'), listRoles);
router.get(
  '/:id',
  isDomain,
  validate(roleIdParamsSchema, 'params'),
  getRoleById,
);
router.put(
  '/:id',
  isDomain,
  validate(roleIdParamsSchema, 'params'),
  validate(updateRoleBodySchema, 'body'),
  updateRole,
);
router.delete(
  '/:id',
  isDomain,
  validate(roleIdParamsSchema, 'params'),
  deleteRole,
);
router.post(
  '/:roleId/permissions',
  isDomain,
  validate(assignPermissionsParamsSchema, 'params'),
  validate(assignPermissionsBodySchema, 'body'),
  assignPermissions,
);
router.post(
  '/:id/role',
  isDomain,
  validate(assignRoleParamsSchema, 'params'),
  validate(assignRoleBodySchema, 'body'),
  assignRole,
);

export default router;
