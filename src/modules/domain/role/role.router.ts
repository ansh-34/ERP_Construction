import { Router } from 'express';
import authMiddleware from '../../../middlewares/auth.js';
import { validate } from '../../../middlewares/validate.js';
import {
  createRole,
  assignPermissions,
  listRoles,
  assignRole,
} from './role.controller.js';
import isAdmin from '../../../middlewares/isAdmin.js';
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

router.post(
  '/entry',
  isAdmin,
  validate(createRoleBodySchema, 'body'),
  createRole,
);
router.post(
  '/:roleId/permissions',
  isAdmin,
  validate(assignPermissionsParamsSchema, 'params'),
  validate(assignPermissionsBodySchema, 'body'),
  assignPermissions,
);
router.get('/list', validate(listRolesQuerySchema, 'query'), listRoles);
router.post(
  '/:id/role',
  isAdmin,
  validate(assignRoleParamsSchema, 'params'),
  validate(assignRoleBodySchema, 'body'),
  assignRole,
);

export default router;
