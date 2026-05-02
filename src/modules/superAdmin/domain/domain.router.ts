import { Router } from 'express';
import { validate } from '../../../middlewares/validate';
import validateSuperAdmin from '../../../middlewares/validateSuperAdmin';
import { seedDomain, verifyDomainToken } from './domain.controller';
import {
  seedDomainBodySchema,
  verifyDomainTokenQuerySchema,
} from './domain.validator';

const router = Router();

router.post(
  '/seed',
  validateSuperAdmin,
  validate(seedDomainBodySchema, 'body'),
  seedDomain,
);
router.get(
  '/verify',
  validate(verifyDomainTokenQuerySchema, 'query'),
  verifyDomainToken,
);

export default router;
