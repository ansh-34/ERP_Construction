import { z } from 'zod';
import {
  idParamSchema,
  paginationQuerySchema,
} from '../../common/common.validator.js';

const industries = [
  'CONSTRUCTION',
  'MANUFACTURING',
  'MINING',
  'PROPERTY',
  'PROPERTY_MANAGEMENT',
] as const;

const normalizedEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z.preprocess(
    (value) => (typeof value === 'string' ? value.trim().toUpperCase() : value),
    z.enum(values),
  );

const localizedText = z
  .record(
    z.string().regex(/^[a-z]{2}$/, 'Invalid language code'),
    z.string().trim().min(1, 'Translation cannot be empty'),
  )
  .refine((data) => !!data.en, {
    message: 'English (en) translation is required',
    path: ['en'],
  });

export const createUserTypeBodySchema = z.object({
  name: localizedText,
  description: z.string().trim().optional(),
  industryType: normalizedEnum(industries),
});

export const updateUserTypeBodySchema = z
  .object({
    name: localizedText.optional(),
    description: z.string().trim().nullable().optional(),
    industryType: normalizedEnum(industries).optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'At least one field is required',
  });

export const listUserTypesQuerySchema = paginationQuerySchema.extend({
  limit: z.coerce.number().int().min(1).max(500).optional(),
  industryType: normalizedEnum(industries).optional(),
  searchKey: z.string().optional(),
});

export const userTypeIdParamsSchema = idParamSchema;
