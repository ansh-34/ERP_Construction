import { Router } from 'express';
import { validate } from '../../../middlewares/validate.js';
import { domainUserTypeController } from './domainUserType.controller';
import {
  createDomainUserTypeBodySchema,
  listDomainUserTypesQuerySchema,
  domainUserTypeIdParamsSchema,
} from './domainUserType.validator';

const router = Router();

// Browse global UserTypes for this domain's industry (not yet selected)
router.get(
  '/available',
  validate(listDomainUserTypesQuerySchema, 'query'),
  domainUserTypeController.listAvailable,
);

// Select one or more global UserTypes to map into this domain
router.post(
  '/',
  validate(createDomainUserTypeBodySchema, 'body'),
  domainUserTypeController.create,
);

// List selected (mapped) user types
router.get(
  '/',
  validate(listDomainUserTypesQuerySchema, 'query'),
  domainUserTypeController.list,
);

router.get(
  '/:id',
  validate(domainUserTypeIdParamsSchema, 'params'),
  domainUserTypeController.getById,
);

router.delete(
  '/:id',
  validate(domainUserTypeIdParamsSchema, 'params'),
  domainUserTypeController.softDelete,
);

export default router;
