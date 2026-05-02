import { z } from 'zod';

export const superAdminLoginBodySchema = z.object({
  identifier: z.string().email(),
  password: z.string().min(1),
});
