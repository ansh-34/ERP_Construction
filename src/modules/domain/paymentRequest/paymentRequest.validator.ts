import { z } from 'zod';
import {
  idParamSchema,
  paginationQuerySchema,
  statusFilterSchema,
} from '../../common/common.validator.js';

export const createPaymentRequestBodySchema = z.object({
  date: z.string().datetime().optional(),
  type: z.string().min(1, 'Type is required'),
  vendorId: z.string().uuid('Invalid vendor ID'),
  projectId: z.string().uuid('Invalid project ID'),
  referenceNumber: z.string().min(1, 'Reference number is required'),
  tds: z.number().min(0, 'TDS must be >= 0'),
  grossAmount: z.number().min(0, 'Gross amount must be >= 0'),
  netPayable: z.number().min(0, 'Net payable must be >= 0'),
  notes: z.string().optional(),
  paymentStatus: z
    .enum(['PENDING', 'APPROVED', 'PAID'])
    .optional()
    .default('PENDING'),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional().default('ACTIVE'),
});

export const updatePaymentRequestBodySchema = z.object({
  date: z.string().datetime().optional(),
  type: z.string().min(1).optional(),
  vendorId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
  referenceNumber: z.string().min(1).optional(),
  tds: z.number().min(0).optional(),
  grossAmount: z.number().min(0).optional(),
  netPayable: z.number().min(0).optional(),
  notes: z.string().optional(),
  paymentStatus: z.enum(['PENDING', 'APPROVED', 'PAID']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export const listPaymentRequestsQuerySchema = paginationQuerySchema
  .merge(statusFilterSchema)
  .extend({
    projectId: z.string().uuid().optional(),
    vendorId: z.string().uuid().optional(),
    paymentStatus: z.enum(['PENDING', 'APPROVED', 'PAID']).optional(),
    searchKey: z.string().optional(),
  });

export const paymentRequestIdParamsSchema = idParamSchema;
