import { z } from 'zod';
import {
  idParamSchema,
  paginationQuerySchema,
  statusFilterSchema,
} from '../../common/common.validator.js';

const optionalText = z.string().trim().min(1).optional();

export const createCustomerBodySchema = z.object({
  name: z.string().trim().min(1, 'Customer name is required'),
  phoneCode: optionalText,
  phone: optionalText,
  paymentTerms: z.enum(['CASH', 'CREDIT']).default('CASH'),
  gstNumber: optionalText,
  billingName: optionalText,
  billingAddress: optionalText,
  shippingAddress: optionalText,
  locationId: z.string().uuid('Invalid location ID').optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

export const updateCustomerBodySchema = z.object({
  name: optionalText,
  phoneCode: optionalText,
  phone: optionalText,
  paymentTerms: z.enum(['CASH', 'CREDIT']).optional(),
  gstNumber: optionalText,
  billingName: optionalText,
  billingAddress: optionalText,
  shippingAddress: optionalText,
  locationId: z.string().uuid('Invalid location ID').optional(),
  status: statusFilterSchema.shape.status.optional(),
});

export const listCustomersQuerySchema = paginationQuerySchema
  .merge(statusFilterSchema)
  .extend({ searchKey: z.string().optional() });

export const customerIdParamSchema = idParamSchema;
