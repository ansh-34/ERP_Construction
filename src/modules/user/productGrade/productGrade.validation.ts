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
  status: z
    .enum(['active', 'inactive', 'ACTIVE', 'INACTIVE'])
    .default('ACTIVE'),
});

export const updateProductGradeBodySchema = z.object({
  gradeDisplayName: localizedName.optional(),
  gradeCode: z.string().min(1).optional(),
  status: statusFilterSchema.shape.status.optional(),
});

//  Query schemas
export const listProductGradeQuerySchema = pageBasedPaginationQuerySchema
  .merge(statusFilterSchema)
  .extend({
    searchKey: z.string().optional(),
  });

export const listAllGradesAndRatesQuerySchema = pageBasedPaginationQuerySchema
  .merge(statusFilterSchema)
  .extend({
    searchKey: z.string().optional(),
    productId: z.string().uuid().optional().or(z.literal('')),
    gradeId: z.string().uuid().optional().or(z.literal('')),
    productGradeId: z.string().uuid().optional().or(z.literal('')),
  });

//  Param schemas
export const productGradeProductIdParamSchema = z.object({
  productId: z.string().uuid(),
});

export const productGradeIdParamSchema = idParamSchema.extend({
  productId: z.string().uuid(),
});
