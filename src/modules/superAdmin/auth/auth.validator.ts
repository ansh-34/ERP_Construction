import { z } from 'zod';

export const superAdminLoginBodySchema = z.object({
  superAdminEmail: z.string().email(),
  superAdminPassword: z.string().min(1),
});
