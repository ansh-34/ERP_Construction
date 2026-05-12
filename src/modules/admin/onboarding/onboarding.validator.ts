import { paginationQuerySchema } from '@/modules/common/common.validator';
import { z } from 'zod';

export const onboardingParamsSchema = z.object({
  step: z.enum([
    'EMAIL_VERIFICATION',
    'LANGUAGE_SELECTION',
    'CURRENCY_SELECTION',
  ]),
});

export const onboardingBodySchema = z.object({
  otp: z.string().optional(),
  languageIds: z.array(z.string().min(1)).min(1).optional(),
  currencyIds: z.array(z.string().min(1)).min(1).optional(),
});

export const onboardingLanguageSelectionQuerySchema = z.object({
  ...paginationQuerySchema.shape,
  searchKey: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

export const onboardingCurrencySelectionQuerySchema = z.object({
  ...paginationQuerySchema.shape,
  searchKey: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
});
