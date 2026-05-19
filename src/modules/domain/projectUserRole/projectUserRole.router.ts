import { Router } from 'express';
import { validate } from '../../../middlewares/validate.js';
import {
  assign,
  list,
  listByProject,
  listByUser,
  getById,
  update,
  remove,
} from './projectUserRole.controller.js';
import {
  assignProjectUserRoleBodySchema,
  listProjectUserRolesQuerySchema,
  projectIdParamsSchema,
  projectUserRoleIdParamsSchema,
  updateProjectUserRoleBodySchema,
  userIdParamsSchema,
} from './projectUserRole.validator.js';

const router = Router();

// Create assignment - write (Domain only)
router.post('/', validate(assignProjectUserRoleBodySchema, 'body'), assign);

// Read assignments (Any authenticated user)
router.get('/', validate(listProjectUserRolesQuerySchema, 'query'), list);

router.get(
  '/project/:projectId',
  validate(projectIdParamsSchema, 'params'),
  validate(listProjectUserRolesQuerySchema, 'query'),
  listByProject,
);

router.get(
  '/user/:userId',
  validate(userIdParamsSchema, 'params'),
  validate(listProjectUserRolesQuerySchema, 'query'),
  listByUser,
);

router.get('/:id', validate(projectUserRoleIdParamsSchema, 'params'), getById);

// Update/Delete assignments - write (Domain only)
router.put(
  '/:id',
  validate(projectUserRoleIdParamsSchema, 'params'),
  validate(updateProjectUserRoleBodySchema, 'body'),
  update,
);

router.delete(
  '/:id',
  validate(projectUserRoleIdParamsSchema, 'params'),
  remove,
);

export default router;
