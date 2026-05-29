import { Router } from 'express';
import { validate } from '../../../middlewares/validate.js';
import { listModulePermissions } from './modulePermission.controller.js';
import { listModulePermissionsQuerySchema } from './modulePermission.validator.js';

const router = Router();

router.get(
  '/',
  validate(listModulePermissionsQuerySchema, 'query'),
  listModulePermissions,
);

export default router;
