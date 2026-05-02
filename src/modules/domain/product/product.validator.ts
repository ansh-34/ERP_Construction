import { z } from 'zod';
import {
  idParamSchema,
  paginationQuerySchema,
} from '../../common/common.validator.js';

export const createProductBodySchema = z.object({
  displayName: z.any(),
  code: z.string().min(1),
  productType: z.string().min(1),
  status: z.string(),
});

export const listProductsQuerySchema = paginationQuerySchema;

export const productIdParamsSchema = idParamSchema;
