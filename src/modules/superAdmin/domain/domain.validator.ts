import { z } from 'zod';

export const seedDomainBodySchema = z.object({
  domainName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(1),
  phone: z.string().optional(),
  phoneCode: z.string().optional(),
  organizationType: z.any().optional(),
});

export const verifyDomainTokenQuerySchema = z.object({
  email: z.string().email(),
  token: z.string().min(1),
});
