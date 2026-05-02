import { z } from 'zod';

const industryValues = [
  'CONSTRUCTION',
  'MANUFACTURING',
  'MINING',
  'PROPERTY',
] as const;

const normalizeIndustry = (value: unknown) =>
  typeof value === 'string' ? value.trim().toUpperCase() : value;

export const loginBodySchema = z.object({
  identifier: z.string().email(),
  password: z.string().min(1),
  speciality: z.preprocess(normalizeIndustry, z.enum(industryValues)),
});
