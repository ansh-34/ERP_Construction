import { z } from 'zod';
import {
  idParamSchema,
  pageBasedPaginationQuerySchema,
  statusFilterSchema,
} from '../../common/common.validator.js';

const localizedName = z
  .record(
    z.string().regex(/^[a-z]{2}$/, 'Invalid language code'),
    z.string().min(1, 'Translation cannot be empty'),
  )
  .refine((data) => !!data.en, {
    message: 'English (en) translation is required',
    path: ['en'],
  });

export const createProductGradeBodySchema = z.object({
  gradeDisplayName: localizedName,
  status: z.enum(['active', 'inactive']).default('active'),
});

export const updateProductGradeBodySchema = z.object({
  gradeDisplayName: localizedName.optional(),
  gradeCode: z.string().min(1).optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

//  Query schemas
export const listProductGradeQuerySchema = pageBasedPaginationQuerySchema
  .merge(statusFilterSchema)
  .extend({
    searchKey: z.string().optional(),
  });

//  Param schemas
export const productGradeProductIdParamSchema = z.object({
  productId: z.string().uuid(),
});

export const productGradeIdParamSchema = idParamSchema.extend({
  productId: z.string().uuid(),
});
