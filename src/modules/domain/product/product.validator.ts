import { z } from 'zod';
import {
  idParamSchema,
  paginationQuerySchema,
  statusFilterSchema,
} from '../../common/common.validator.js';

export const createProductBodySchema = z.object({
  displayName: z.any(),
  code: z.string().min(1),
  productType: z.string().min(1),
  status: z.enum(['active', 'inactive']).default('active'),
});

export const updateProductBodySchema = z.object({
  displayName: z.any().optional(),
  code: z.string().min(1).optional(),
  productType: z.string().min(1).optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

export const listProductsQuerySchema =
  paginationQuerySchema.merge(statusFilterSchema);

export const productIdParamsSchema = idParamSchema;

export type CreateProductDto = z.infer<typeof createProductBodySchema>;
export type UpdateProductDto = z.infer<typeof updateProductBodySchema>;
export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;
