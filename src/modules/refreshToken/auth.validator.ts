import { z } from 'zod';

export const refreshTokenSchema = z.object({
  accessToken: z.string().min(1).optional(),
  refreshToken: z.string().min(1).optional(),
});
