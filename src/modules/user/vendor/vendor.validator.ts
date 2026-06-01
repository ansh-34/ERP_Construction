import { z } from 'zod';
import {
  idParamSchema,
  pageBasedPaginationQuerySchema,
  statusFilterSchema,
} from '../../common/common.validator.js';

const optionalText = z.string().trim().min(1).optional();

export const createVendorBodySchema = z.object({
  code: z.string().trim().min(1, 'Vendor code is required'),
  name: z.string().trim().min(1, 'Vendor name is required'),
  email: z.string().trim().email('Invalid vendor email'),
  contactPerson: optionalText,
  phoneCode: optionalText,
  phone: optionalText,
  industry: optionalText,
  address: optionalText,
  status: z
    .enum(['active', 'inactive', 'ACTIVE', 'INACTIVE'])
    .default('ACTIVE'),
});

export const updateVendorBodySchema = z.object({
  code: optionalText,
  name: optionalText,
  email: z.string().trim().email('Invalid vendor email').optional(),
  contactPerson: optionalText,
  phoneCode: optionalText,
  phone: optionalText,
  industry: optionalText,
  address: optionalText,
  status: statusFilterSchema.shape.status.optional(),
});

export const listVendorsQuerySchema = pageBasedPaginationQuerySchema
  .merge(statusFilterSchema)
  .extend({ searchKey: z.string().optional() });

export const vendorIdParamSchema = idParamSchema;
