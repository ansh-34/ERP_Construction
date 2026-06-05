import { z } from 'zod';
import {
  idParamSchema,
  paginationQuerySchema,
  statusFilterSchema,
} from '../../common/common.validator.js';

export const grnProductSchema = z.object({
  material: z.string().min(1),
  quantity: z.number().positive(),
  tax: z.number().nonnegative().optional().default(0),
  uomId: z.string().uuid(),
  rate: z.number().nonnegative().optional().default(0),
});

export const grnProductInputSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().positive(),
  tax: z.number().nonnegative().optional(),
});

export const createGrnBodySchema = z.object({
  wbReference: z.string().optional(),
  invoiceId: z.string().uuid(),
  totalItems: z.number().int().nonnegative().optional(),
  totalTax: z.number().nonnegative().optional().default(0),
  totalAmount: z.number().nonnegative().optional(),
  grnProducts: z.array(grnProductInputSchema).optional(),
});

export const updateGrnBodySchema = z.object({
  wbReference: z.string().optional(),
  totalItems: z.number().int().nonnegative().optional(),
  totalTax: z.number().nonnegative().optional(),
  totalAmount: z.number().nonnegative().optional(),
  grnProducts: z
    .array(
      grnProductSchema.extend({
        id: z.string().uuid().optional(),
      }),
    )
    .optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export const approveRejectGrnBodySchema = z.object({
  approvalStatus: z.enum(['APPROVED', 'REJECTED']),
});

export const listGrnsQuerySchema = paginationQuerySchema
  .merge(statusFilterSchema)
  .extend({
    searchKey: z.string().optional(),
    approvalStatus: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
    projectId: z.string().uuid().optional(),
    invoiceId: z.string().uuid().optional(),
  });

export const grnIdParamsSchema = idParamSchema;

export const createGrnProductBodySchema = grnProductSchema;

export const updateGrnProductBodySchema = grnProductSchema.partial();

export const grnProductIdParamsSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
});
