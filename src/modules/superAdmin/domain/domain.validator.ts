import { z } from 'zod';

const industryValues = [
  'CONSTRUCTION',
  'MANUFACTURING',
  'MINING',
  'PROPERTY',
] as const;

const normalizeIndustry = (value: unknown) =>
  typeof value === 'string' ? value.trim().toUpperCase() : value;

const industrySchema = z.preprocess(normalizeIndustry, z.enum(industryValues));

export const seedDomainBodySchema = z.object({
  domainName: z
    .record(
      z.string().regex(/^[a-z]{2}$/, 'Invalid language code'),
      z.string().min(1, 'Translation cannot be empty'),
    )
    .refine((data) => !!data.en, {
      message: 'English (en) translation is required',
      path: ['en'],
    }),
  email: z.string().email(),
  password: z.string().min(1),
  industry: industrySchema,
  phone: z.string().optional(),
  phoneCode: z.string().optional(),
  organizationType: z.any().optional(),
});

export const verifyDomainTokenQuerySchema = z.object({
  email: z.string().email(),
  token: z.string().min(1),
});
