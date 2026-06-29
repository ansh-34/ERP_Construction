import { z } from 'zod';
import {
  idParamSchema,
  paginationQuerySchema,
  statusFilterSchema,
} from '../../common/common.validator.js';

const localizedName = z
  .record(z.string(), z.string().trim().min(1))
  .refine(
    (value) => typeof value.en === 'string' && value.en.trim().length > 0,
    {
      message: 'name.en is required',
    },
  );

const categoryTypeSchema = z.enum([
  'ASSET',
  'LIABILITY',
  'EQUITY',
  'REVENUE',
  'EXPENSE',
]);
const normalBalanceSchema = z.enum(['DEBIT', 'CREDIT']);

export const createAccountCategoryBodySchema = z.object({
  name: localizedName,
  categoryType: categoryTypeSchema,
  normalBalance: normalBalanceSchema,
  parentId: z.string().uuid('Invalid parent ID').optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
  isPostingAllowed: z.boolean().optional(),
  isSystem: z.boolean().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

export const updateAccountCategoryBodySchema = z.object({
  name: localizedName.optional(),
  categoryType: categoryTypeSchema.optional(),
  normalBalance: normalBalanceSchema.optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
  isPostingAllowed: z.boolean().optional(),
  isSystem: z.boolean().optional(),
  status: statusFilterSchema.shape.status.optional(),
});

export const listAccountCategoriesQuerySchema = paginationQuerySchema
  .merge(statusFilterSchema)
  .extend({
    searchKey: z.string().optional(),
    categoryType: categoryTypeSchema.optional(),
    parentId: z.string().uuid('Invalid parent ID').optional(),
  });

export const accountCategoryIdParamSchema = idParamSchema;
