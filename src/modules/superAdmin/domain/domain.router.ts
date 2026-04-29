import { Router } from 'express';
import { validate } from '../../../middlewares/validate.ts';
import validateSuperadmin from '../../../middlewares/validateSuperadmin.ts';
import { seedDomain, verifyDomainToken } from './domain.controller.ts';
import {
  seedDomainBodySchema,
  verifyDomainTokenQuerySchema,
} from './domain.validator.ts';

const router = Router();

router.post(
  '/seed',
  validateSuperadmin,
  validate(seedDomainBodySchema, 'body'),
  seedDomain,
);
router.get(
  '/verify',
  validate(verifyDomainTokenQuerySchema, 'query'),
  verifyDomainToken,
);

export default router;
