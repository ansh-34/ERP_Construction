import { Router } from 'express';
import { validate } from '../../../middlewares/validate.js';
import authMiddleware from '../../../middlewares/auth.js';
import {
  seedDomain,
  listDomains,
  getDomainById,
  updateDomain,
  deleteDomain,
} from './domain.controller.js';
import {
  seedDomainBodySchema,
  listDomainsQuerySchema,
  domainIdParamSchema,
  updateDomainBodySchema,
} from './domain.validator.js';

const router = Router();

router.use(authMiddleware);

router.post(
  '/',
  authMiddleware,
  validate(seedDomainBodySchema, 'body'),
  seedDomain,
);

router.get('/', validate(listDomainsQuerySchema, 'query'), listDomains);

router.get('/:id', validate(domainIdParamSchema, 'params'), getDomainById);

router.put(
  '/:id',
  validate(domainIdParamSchema, 'params'),
  validate(updateDomainBodySchema, 'body'),
  updateDomain,
);

router.delete('/:id', validate(domainIdParamSchema, 'params'), deleteDomain);

export default router;
