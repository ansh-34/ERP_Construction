import { Router } from 'express';
import { validate } from '../../../middlewares/validate.js';
import { verifyOnboardToken } from './onboarding.controller.js';
import { verifyOnboardTokenQuery } from './onboarding.validator.js';

const router = Router();

router.get(
  '/verify',
  validate(verifyOnboardTokenQuery, 'query'),
  verifyOnboardToken,
);

export default router;
