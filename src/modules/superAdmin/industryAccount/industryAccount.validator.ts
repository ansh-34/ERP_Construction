import { z } from 'zod';
import {
  paginationQuerySchema,
  statusFilterSchema,
} from '../../common/common.validator.js';

const industries = [
  'CONSTRUCTION',
  'MANUFACTURING',
  'MINING',
  'PROPERTY',
] as const;
const industrySchema = z.preprocess(
  (value) => (typeof value === 'string' ? value.trim().toUpperCase() : value),
  z.enum(industries),
);
const localizedName = z
  .record(
    z.string().regex(/^[a-z]{2}$/, 'Invalid language code'),
    z.string().trim().min(1, 'Translation cannot be empty'),
  )
  .refine((value) => !!value.en, {
    message: 'English (en) translation is required',
    path: ['en'],
  });

export const createIndustryAccountBodySchema = z.object({
  name: localizedName,
  code: z.string().trim().min(1).max(100).optional(),
  description: z.string().trim().min(1).max(500).nullable().optional(),
  parentId: z.string().uuid().nullable().optional(),
  industryAccountCategoryId: z.string().uuid(),
  currencyId: z.string().uuid().nullable().optional(),
  isCashOrBank: z.boolean().default(false),
  isPostingAllowed: z.boolean().default(true),
  isSystem: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).default(0),
  industryType: industrySchema,
  status: statusFilterSchema.shape.status.default('ACTIVE'),
});

export const updateIndustryAccountBodySchema = z
  .object({
    name: localizedName.optional(),
    code: z.string().trim().min(1).max(100).optional(),
    description: z.string().trim().min(1).max(500).nullable().optional(),
    parentId: z.string().uuid().nullable().optional(),
    currencyId: z.string().uuid().nullable().optional(),
    isCashOrBank: z.boolean().optional(),
    isPostingAllowed: z.boolean().optional(),
    isSystem: z.boolean().optional(),
    sortOrder: z.coerce.number().int().min(0).optional(),
    status: statusFilterSchema.shape.status.optional(),
  })
  .refine((value) => Object.values(value).some((item) => item !== undefined), {
    message: 'empty update payload',
  });

export const listIndustryAccountsQuerySchema = paginationQuerySchema.extend({
  industryType: industrySchema.optional(),
  categoryId: z.string().uuid().optional(),
  parentId: z.string().uuid().optional(),
  isPostingAllowed: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
  isCashOrBank: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
  status: statusFilterSchema.shape.status.optional(),
  searchKey: z.string().trim().min(1).optional(),
});

export const industryAccountIdParamsSchema = z.object({
  id: z.string().uuid('Invalid industry account ID'),
});
