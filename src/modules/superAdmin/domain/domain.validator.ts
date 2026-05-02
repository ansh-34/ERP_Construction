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

const industryListSchema = z
  .union([industrySchema, z.array(industrySchema).min(1)])
  .transform((industry) => (Array.isArray(industry) ? industry : [industry]));

export const seedDomainBodySchema = z.object({
  domainName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(1),
  industry: industryListSchema,
  phone: z.string().optional(),
  phoneCode: z.string().optional(),
  organizationType: z.any().optional(),
});

export const verifyDomainTokenQuerySchema = z.object({
  email: z.string().email(),
  token: z.string().min(1),
});
