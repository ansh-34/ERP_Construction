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
const categoryTypes = [
  'ASSET',
  'LIABILITY',
  'EQUITY',
  'REVENUE',
  'EXPENSE',
] as const;

const normalizedEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z.preprocess(
    (value) => (typeof value === 'string' ? value.trim().toUpperCase() : value),
    z.enum(values),
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

export const createIndustryAccountCategoryBodySchema = z.object({
  name: localizedName,
  code: z.string().trim().min(1).max(100).optional(),
  categoryType: normalizedEnum(categoryTypes),
  normalBalance: normalizedEnum(['DEBIT', 'CREDIT']),
  parentId: z.string().uuid().nullable().optional(),
  industryType: normalizedEnum(industries),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isPostingAllowed: z.boolean().default(false),
  isSystem: z.boolean().default(true),
  status: statusFilterSchema.shape.status.default('ACTIVE'),
});

export const updateIndustryAccountCategoryBodySchema = z
  .object({
    name: localizedName.optional(),
    code: z.string().trim().min(1).max(100).optional(),
    categoryType: normalizedEnum(categoryTypes).optional(),
    normalBalance: normalizedEnum(['DEBIT', 'CREDIT']).optional(),
    parentId: z.string().uuid().nullable().optional(),
    sortOrder: z.coerce.number().int().min(0).optional(),
    isPostingAllowed: z.boolean().optional(),
    isSystem: z.boolean().optional(),
    status: statusFilterSchema.shape.status.optional(),
  })
  .refine((value) => Object.values(value).some((item) => item !== undefined), {
    message: 'empty update payload',
  });

export const listIndustryAccountCategoriesQuerySchema =
  paginationQuerySchema.extend({
    industryType: normalizedEnum(industries).optional(),
    categoryType: normalizedEnum(categoryTypes).optional(),
    parentId: z.string().uuid().optional(),
    status: statusFilterSchema.shape.status.optional(),
    searchKey: z.string().trim().min(1).optional(),
  });

export const industryAccountCategoryIdParamsSchema = z.object({
  id: z.string().uuid('Invalid industry account category ID'),
});
