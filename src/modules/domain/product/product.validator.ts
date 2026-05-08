import { z } from 'zod';
import {
  idParamSchema,
  paginationQuerySchema,
  statusFilterSchema,
} from '../../common/common.validator.js';

export const createProductBodySchema = z.object({
  displayName: z
    .record(
      z.string().regex(/^[a-z]{2}$/, 'Invalid language code'),
      z.string().min(1, 'Translation cannot be empty'),
    )
    .refine((data) => !!data.en, {
      message: 'English (en) translation is required',
      path: ['en'],
    }),
  productType: z.string().min(1),
  status: z.enum(['active', 'inactive']).default('active'),
});

export const updateProductBodySchema = z.object({
  displayName: z
    .record(
      z.string().regex(/^[a-z]{2}$/, 'Invalid language code'),
      z.string().min(1, 'Translation cannot be empty'),
    )
    .refine((data) => !!data.en, {
      message: 'English (en) translation is required',
      path: ['en'],
    })
    .optional(),
  code: z.string().min(1).optional(),
  productType: z.string().min(1).optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

export const listProductsQuerySchema = paginationQuerySchema
  .merge(statusFilterSchema)
  .extend({
    searchKey: z.string().optional(),
  });

export const productIdParamsSchema = idParamSchema;

export type CreateProductDto = z.infer<typeof createProductBodySchema>;
export type UpdateProductDto = z.infer<typeof updateProductBodySchema>;
export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;
