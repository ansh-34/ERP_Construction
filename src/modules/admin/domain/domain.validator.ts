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

export const updateDomainBodySchema = z.object({
  name: z
    .record(
      z.string().regex(/^[a-z]{2}$/, 'Invalid language code'),
      z.string().min(1, 'Translation cannot be empty'),
    )
    .optional(),
  phone: z.string().optional(),
  phoneCode: z.string().optional(),
  organizationType: z.any().optional(),
  industry: industrySchema.optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export const listDomainsQuerySchema = z.object({
  limit: z.string().regex(/^\d+$/).optional(),
  offset: z.string().regex(/^\d+$/).optional(),
  searchKey: z.string().optional(),
});

export const domainIdParamSchema = z.object({
  id: z.string().uuid('Invalid domain ID'),
});
