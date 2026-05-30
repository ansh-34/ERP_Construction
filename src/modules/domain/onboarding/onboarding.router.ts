import { Router } from 'express';
import { validate } from '../../../middlewares/validate.js';
import { verifyOnboardToken, onboardDomain } from './onboarding.controller.js';
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

router.post(
  '/:step',
  validate(onboardingParamsSchema, 'params'),
  validate(onboardingBodySchema, 'body'),
  onboardDomain,
);

export default router;
