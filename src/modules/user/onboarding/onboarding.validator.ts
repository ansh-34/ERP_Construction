import { z } from 'zod';

export const verifyOnboardTokenQuery = z.object({
  email: z.string().email(),
  token: z.string().min(1),
});

export const onboardingParamsSchema = z.object({
  step: z.enum(['EMAIL_VERIFICATION']),
});

export const onboardingBodySchema = z.object({
  otp: z.string().optional(),
});
