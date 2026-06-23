import { z } from 'zod';
import {
  idParamSchema,
  paginationQuerySchema,
  statusFilterSchema,
} from '../../common/common.validator.js';

export const createCustomerRateBodySchema = z.object({
  customerId: z.string().uuid('Invalid customer ID'),
  productId: z.string().uuid('Invalid product ID'),
  productGradeId: z.string().uuid('Invalid product grade ID'),
  rate: z.number().min(0, 'Rate must be >= 0'),
  currencyId: z.string().uuid('Invalid currency ID'),
  uomId: z.string().uuid('Invalid UOM ID'),
  effectiveFrom: z.coerce.date(),
  effectiveTo: z.coerce.date().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

export const updateCustomerRateBodySchema = z.object({
  rate: z.number().min(0, 'Rate must be >= 0').optional(),
  currencyId: z.string().uuid('Invalid currency ID').optional(),
  uomId: z.string().uuid('Invalid UOM ID').optional(),
  effectiveFrom: z.coerce.date().optional(),
  effectiveTo: z.coerce.date().optional(),
  status: statusFilterSchema.shape.status.optional(),
});

export const listCustomerRatesQuerySchema = paginationQuerySchema
  .merge(statusFilterSchema)
  .extend({
    customerId: z.string().uuid().optional(),
    productId: z.string().uuid().optional(),
    productGradeId: z.string().uuid().optional(),
  });

export const customerRateIdParamSchema = idParamSchema;
