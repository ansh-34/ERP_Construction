import { Router } from 'express';
import { validate } from '../../../middlewares/validate.js';
import {
  onboardAdmin,
  languageSelectionList,
  currencySelectionList,
} from './onboarding.controller.js';
import {
  onboardingParamsSchema,
  onboardingBodySchema,
  onboardingCurrencySelectionQuerySchema,
  onboardingLanguageSelectionQuerySchema,
} from './onboarding.validator.js';
import authMiddleware from '../../../middlewares/auth.js';
const router = Router();

router.use(authMiddleware);

router.post(
  '/:step',
  validate(onboardingParamsSchema, 'params'),
  validate(onboardingBodySchema, 'body'),
  onboardAdmin,
);
router.get(
  '/selection/language',
  validate(onboardingLanguageSelectionQuerySchema, 'query'),
  languageSelectionList,
);
router.get(
  '/selection/currency',
  validate(onboardingCurrencySelectionQuerySchema, 'query'),
  currencySelectionList,
);

export default router;
