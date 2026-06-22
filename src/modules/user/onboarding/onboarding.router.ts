import { Router } from 'express';
import { validate } from '../../../middlewares/validate.js';
import { verifyOnboardToken, onboardUser } from './onboarding.controller.js';
import {
  onboardingBodySchema,
  onboardingParamsSchema,
  verifyOnboardTokenQuery,
} from './onboarding.validator.js';
import authMiddleware from '../../../middlewares/auth.js';

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
  authMiddleware,
  onboardUser,
);

export default router;
