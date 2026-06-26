import { Router } from 'express';
import authMiddleware from '../../../middlewares/auth.js';
import { validate } from '../../../middlewares/validate.js';
import {
  deleteAdminUserType,
  getAdminUserType,
  listAdminUserTypes,
  selectAdminUserTypes,
} from './adminUserType.controller.js';
import {
  adminUserTypeIdParamsSchema,
  listAdminUserTypesQuerySchema,
  selectAdminUserTypesBodySchema,
} from './adminUserType.validator.js';

const router = Router();

router.use(authMiddleware);

router.post(
  '/select',
  validate(selectAdminUserTypesBodySchema, 'body'),
  selectAdminUserTypes,
);
router.get(
  '/',
  validate(listAdminUserTypesQuerySchema, 'query'),
  listAdminUserTypes,
);
router.get(
  '/:id',
  validate(adminUserTypeIdParamsSchema, 'params'),
  getAdminUserType,
);
router.delete(
  '/:id',
  validate(adminUserTypeIdParamsSchema, 'params'),
  deleteAdminUserType,
);

export default router;
