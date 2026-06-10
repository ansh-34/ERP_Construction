import { z } from 'zod';
import {
  idParamSchema,
  paginationQuerySchema,
  statusFilterSchema,
} from '../../common/common.validator.js';

const industryValues = [
  'CONSTRUCTION',
  'MANUFACTURING',
  'MINING',
  'PROPERTY',
] as const;

const normalizeIndustry = (value: unknown) =>
  typeof value === 'string' ? value.trim().toUpperCase() : value;

const industrySchema = z.preprocess(normalizeIndustry, z.enum(industryValues));

const localizedNameSchema = z
  .record(
    z.string().regex(/^[a-z]{2}$/, 'Invalid language code'),
    z.string().min(1, 'Translation cannot be empty'),
  )
  .refine((data) => !!data.en, {
    message: 'English (en) translation is required',
    path: ['en'],
  });

export const createIndustryRoleTemplateBodySchema = z.object({
  name: localizedNameSchema,
  code: z.string().min(1).optional(),
  level: z.number().int().min(0).optional(),
  industry: industrySchema,
  status: statusFilterSchema.shape.status.optional(),
});

export const bulkCreateIndustryRoleTemplateBodySchema = z.object({
  industry: industrySchema,
  roles: z
    .array(
      z.object({
        name: localizedNameSchema,
        code: z.string().min(1).optional(),
        level: z.number().int().min(0).optional(),
        status: statusFilterSchema.shape.status.optional(),
      }),
    )
    .min(1),
});

export const updateIndustryRoleTemplateBodySchema = z
  .object({
    name: localizedNameSchema.optional(),
    code: z.string().min(1).optional(),
    level: z.number().int().min(0).optional(),
    industry: industrySchema.optional(),
    status: statusFilterSchema.shape.status.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'empty update payload',
  });

export const listIndustryRoleTemplatesQuerySchema = z.object({
  ...paginationQuerySchema.shape,
  searchKey: z.string().optional(),
  industry: industrySchema.optional(),
  status: statusFilterSchema.shape.status.optional(),
});

export const industryRoleTemplateIdParamsSchema = idParamSchema;
