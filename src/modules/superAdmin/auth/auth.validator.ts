import { z } from 'zod';

export const superAdminLoginBodySchema = z.object({
  identifier: z.string().email(),
  password: z.string().min(1),
});

export const refreshTokenSchema = z.object({
  accessToken: z.string().min(1).optional(),
  refreshToken: z.string().min(1).optional(),
});
