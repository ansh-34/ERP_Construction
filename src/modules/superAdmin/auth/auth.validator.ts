import { z } from 'zod';

export const superadminLoginBodySchema = z.object({
  superadminEmail: z.string().email(),
  superadminPassword: z.string().min(1),
});
