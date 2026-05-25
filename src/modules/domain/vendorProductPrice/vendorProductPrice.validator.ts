import { z } from 'zod';
import {
  idParamSchema,
  pageBasedPaginationQuerySchema,
  statusFilterSchema,
} from '../../common/common.validator.js';

export const createVendorProductPriceBodySchema = z.object({
  vendorName: z.string().min(1, 'Vendor name is required'),
  productId: z.string().uuid('Invalid product ID'),
  productGradeId: z.string().uuid('Invalid product grade ID'),
  uomId: z.string().uuid('Invalid UOM ID'),
  price: z.number().min(0, 'Price must be >= 0'),
  productCode: z.string().optional(),
  productGradeCode: z.string().optional(),
  uomCode: z.string().optional(),
  status: z.enum(['active', 'inactive', 'ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

export const updateVendorProductPriceBodySchema = z.object({
  vendorName: z.string().min(1).optional(),
  productId: z.string().uuid().optional(),
  productGradeId: z.string().uuid().optional(),
  uomId: z.string().uuid().optional(),
  price: z.number().min(0).optional(),
  productCode: z.string().optional(),
  productGradeCode: z.string().optional(),
  uomCode: z.string().optional(),
  status: statusFilterSchema.shape.status.optional(),
});

export const listVendorProductPricesQuerySchema =
  pageBasedPaginationQuerySchema.merge(statusFilterSchema);

export const vendorProductPriceIdParamSchema = idParamSchema;
