import { z } from 'zod';
import {
  idParamSchema,
  paginationQuerySchema,
  statusFilterSchema,
} from '../../common/common.validator.js';

export const createVendorProductPriceParamsSchema = idParamSchema;

export const createVendorProductPriceBodySchema = z.array(
  z.object({
    productId: z.string().uuid('Invalid product ID'),
    productGradeId: z.string().uuid('Invalid product grade ID'),
    uomId: z.string().uuid('Invalid UOM ID'),
    currencyId: z.string().uuid('Invalid currency ID'),
    price: z.number().min(0, 'Price must be >= 0'),
  }),
);

export const updateVendorProductPriceBodySchema = z.array(
  z.object({
    vendorProductPriceId: z.string().uuid('Invalid vendor product price ID'),
    price: z.number().min(0, 'Price must be >= 0').optional(),
    currencyId: z.string().uuid('Invalid currency ID').optional(),
    status: statusFilterSchema.shape.status.optional(),
  }),
);

export const listVendorProductPricesQuerySchema = paginationQuerySchema
  .merge(statusFilterSchema)
  .extend({
    searchKey: z.string().optional(),
    productId: z.string().uuid().optional(),
    productCode: z.string().optional(),
    productGradeId: z.string().uuid().optional(),
    currencyId: z.string().uuid().optional(),
    vendorId: z.string().uuid().optional(),
  });

export const vendorProductPriceIdParamSchema = idParamSchema;
