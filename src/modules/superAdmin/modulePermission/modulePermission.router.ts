import { Router } from 'express';
import validateSuperadmin from '../../../middlewares/validateSuperadmin.js';
import { validate } from '../../../middlewares/validate.js';
import {
  setModulePermissions,
  listModulePermissions,
  deleteModulePermissions,
} from './modulePermission.controller.js';
import {
  listModulePermissionsQuerySchema,
  modulePermissionIdParamsSchema,
  setModulePermissionsBodySchema,
} from './modulePermission.validator.js';

const router = Router();

router.use(validateSuperadmin);

router.post(
  '/set',
  validate(setModulePermissionsBodySchema, 'body'),
  setModulePermissions,
);
router.get(
  '/list',
  validate(listModulePermissionsQuerySchema, 'query'),
  listModulePermissions,
);
router.delete(
  '/:id',
  validate(modulePermissionIdParamsSchema, 'params'),
  deleteModulePermissions,
);

export default router;
