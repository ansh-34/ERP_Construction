import { z } from 'zod';

export const verifyOnboardTokenQuery = z.object({
  email: z.string().email(),
  token: z.string().min(1),
});
