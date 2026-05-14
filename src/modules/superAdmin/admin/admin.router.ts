import { Router } from 'express';
import { validate } from '../../../middlewares/validate.js';
import {
  createAdmin,
  listAdmins,
  getAdmin,
  updateAdmin,
  deleteAdmin,
} from './admin.controller.js';
import {
  createAdminSchema,
  listAdminsQuerySchema,
  adminIdSchema,
  updateAdminSchema,
} from './admin.validator.js';
import validateSuperAdmin from '@/middlewares/validateSuperAdmin.js';

const router = Router();

router.post(
  '/',
  validateSuperAdmin,
  validate(createAdminSchema, 'body'),
  createAdmin,
);

router.get(
  '/',
  validateSuperAdmin,
  validate(listAdminsQuerySchema, 'query'),
  listAdmins,
);

router.get(
  '/:id',
  validateSuperAdmin,
  validate(adminIdSchema, 'params'),
  getAdmin,
);

router.put(
  '/:id',
  validateSuperAdmin,
  validate(adminIdSchema, 'params'),
  validate(updateAdminSchema, 'body'),
  updateAdmin,
);

router.delete(
  '/:id',
  validateSuperAdmin,
  validate(adminIdSchema, 'params'),
  deleteAdmin,
);

export default router;
