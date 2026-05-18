import { z } from 'zod';
import {
  idParamSchema,
  paginationQuerySchema,
  statusFilterSchema,
} from '../../common/common.validator.js';

const grnProductSchema = z.object({
  date: z.coerce.date(),
  vendor: z.string().min(1),
  material: z.string().min(1),
  quantity: z.number().positive(),
  tax: z.number().min(0).default(0),
  uomId: z.string().uuid(),
  rate: z.number().min(0).default(0),
  projectId: z.string().uuid().optional(),
});

export const createGrnBodySchema = z.object({
  productOrderCode: z.string().optional(),
  date: z.coerce.date(),
  vendor: z.string().min(1),
  wbReference: z.string().optional(),
  projectId: z.string().uuid().optional(),
  grnProducts: z
    .array(grnProductSchema)
    .optional(),
});

export const updateGrnBodySchema = z.object({
  productOrderCode: z.string().optional(),
  date: z.coerce.date().optional(),
  vendor: z.string().min(1).optional(),
  wbReference: z.string().optional(),
  projectId: z.string().uuid().optional(),
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
  });

export const grnIdParamsSchema = idParamSchema;

// export const createGrnProductBodySchema = grnProductSchema;

// export const updateGrnProductBodySchema = grnProductSchema.partial();

export const grnProductIdParamsSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
});
