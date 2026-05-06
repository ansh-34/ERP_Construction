import { Router } from 'express';
import authMiddleware from '../../../middlewares/auth.js';
import { validate } from '../../../middlewares/validate.js';
import {
  createRole,
  assignPermissions,
  listRoles,
  assignRole,
} from './role.controller.js';
import isDomain from '../../../middlewares/isDomain.js';
import {
  assignPermissionsBodySchema,
  assignPermissionsParamsSchema,
  assignRoleBodySchema,
  assignRoleParamsSchema,
  createRoleBodySchema,
  listRolesQuerySchema,
} from './role.validator.js';

const router = Router();

router.use(authMiddleware);

router.post('/', isDomain, validate(createRoleBodySchema, 'body'), createRole);
router.post(
  '/:roleId/permissions',
  isDomain,
  validate(assignPermissionsParamsSchema, 'params'),
  validate(assignPermissionsBodySchema, 'body'),
  assignPermissions,
);
router.get('/', isDomain, validate(listRolesQuerySchema, 'query'), listRoles);
router.post(
  '/:id/role',
  isDomain,
  validate(assignRoleParamsSchema, 'params'),
  validate(assignRoleBodySchema, 'body'),
  assignRole,
);

export default router;
