import { Router } from 'express';
import { validate } from '../../../middlewares/validate.js';
import authMiddleware from '../../../middlewares/auth.js';
import isDomain from '../../../middlewares/isDomain.js';
import {
  verifyOnboardToken,
  onboardDomain,
  listRoleSelection,
} from './onboarding.controller.js';
import {
  onboardingBodySchema,
  onboardingParamsSchema,
  verifyOnboardTokenQuery,
} from './onboarding.validator.js';

const router = Router();

router.get(
  '/verify',
  validate(verifyOnboardTokenQuery, 'query'),
  verifyOnboardToken,
);

router.get('/role-selection', authMiddleware, isDomain, listRoleSelection);

router.post(
  '/:step',
  validate(onboardingParamsSchema, 'params'),
  validate(onboardingBodySchema, 'body'),
  onboardDomain,
);

export default router;
