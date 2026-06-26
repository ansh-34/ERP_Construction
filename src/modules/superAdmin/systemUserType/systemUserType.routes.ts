import { Router } from 'express';
import { validate } from '../../../middlewares/validate.js';
import validateSuperAdmin from '@/middlewares/validateSuperAdmin.js';
import { systemUserTypeController } from './systemUserType.controller';
import {
  createSystemUserTypeBodySchema,
  listSystemUserTypesQuerySchema,
  systemUserTypeIdParamsSchema,
  updateSystemUserTypeBodySchema,
} from './systemUserType.validator';

const router = Router();

router.use(validateSuperAdmin);

router.post(
  '/',
  validate(createSystemUserTypeBodySchema, 'body'),
  systemUserTypeController.create,
);

router.get(
  '/',
  validate(listSystemUserTypesQuerySchema, 'query'),
  systemUserTypeController.list,
);

router.get(
  '/:id',
  validate(systemUserTypeIdParamsSchema, 'params'),
  systemUserTypeController.getById,
);

router.put(
  '/:id',
  validate(systemUserTypeIdParamsSchema, 'params'),
  validate(updateSystemUserTypeBodySchema, 'body'),
  systemUserTypeController.update,
);

router.delete(
  '/:id',
  validate(systemUserTypeIdParamsSchema, 'params'),
  systemUserTypeController.softDelete,
);

export default router;
