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

const optionalText = z.string().trim().min(1).optional();

export const createAccountBodySchema = z.object({
  name: localizedName,
  description: optionalText,
  accountCategoryId: z.string().uuid('Invalid account category ID'),
  parentId: z.string().uuid('Invalid parent ID').optional(),
  currencyId: z.string().uuid('Invalid currency ID').optional(),
  costCenterId: z.string().uuid('Invalid cost center ID').optional(),
  projectId: z.string().uuid('Invalid project ID').optional(),
  isCashOrBank: z.boolean().optional(),
  isPostingAllowed: z.boolean().optional(),
  isSystem: z.boolean().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

export const updateAccountBodySchema = z.object({
  name: localizedName.optional(),
  description: optionalText,
  accountCategoryId: z.string().uuid('Invalid account category ID').optional(),
  currencyId: z.string().uuid('Invalid currency ID').optional(),
  costCenterId: z.string().uuid('Invalid cost center ID').optional(),
  projectId: z.string().uuid('Invalid project ID').optional(),
  isCashOrBank: z.boolean().optional(),
  isPostingAllowed: z.boolean().optional(),
  isSystem: z.boolean().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
  status: statusFilterSchema.shape.status.optional(),
});

export const listAccountsQuerySchema = paginationQuerySchema
  .merge(statusFilterSchema)
  .extend({
    searchKey: z.string().optional(),
    accountCategoryId: z
      .string()
      .uuid('Invalid account category ID')
      .optional(),
    parentId: z.string().uuid('Invalid parent ID').optional(),
    isCashOrBank: z.coerce.boolean().optional(),
    isPostingAllowed: z
      .enum(['true', 'false'])
      .transform((value) => value === 'true')
      .optional(),
  });

export const accountIdParamSchema = idParamSchema;
