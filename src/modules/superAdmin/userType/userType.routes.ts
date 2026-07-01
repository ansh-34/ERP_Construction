import { Router } from 'express';
import { validate } from '../../../middlewares/validate.js';
import validateSuperAdmin from '@/middlewares/validateSuperAdmin.js';
import { userTypeController } from './userType.controller';
import {
  createUserTypeBodySchema,
  listUserTypesQuerySchema,
  updateUserTypeBodySchema,
  userTypeIdParamsSchema,
} from './userType.validator';

const router = Router();

router.use(validateSuperAdmin);

router.post(
  '/',
  validate(createUserTypeBodySchema, 'body'),
  userTypeController.create,
);

router.get(
  '/',
  validate(listUserTypesQuerySchema, 'query'),
  userTypeController.list,
);

router.get(
  '/:id',
  validate(userTypeIdParamsSchema, 'params'),
  userTypeController.getById,
);

router.put(
  '/:id',
  validate(userTypeIdParamsSchema, 'params'),
  validate(updateUserTypeBodySchema, 'body'),
  userTypeController.update,
);

router.delete(
  '/:id',
  validate(userTypeIdParamsSchema, 'params'),
  userTypeController.softDelete,
);

export default router;
