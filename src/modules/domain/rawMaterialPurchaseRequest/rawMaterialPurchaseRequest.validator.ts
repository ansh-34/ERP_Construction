import { z } from 'zod';
import {
  idParamSchema,
  paginationQuerySchema,
} from '../../common/common.validator.js';

export const createRawMaterialPurchaseRequestBodySchema = z.object({
  // date: z.string().datetime({ message: 'Invalid date format' }),
  type: z.enum(['IMPORT', 'LOCAL']),
  productId: z.string().uuid(),
  productGradeId: z.string().uuid(),
  quantity: z.number().positive(),
  uomId: z.string().uuid(),
  vendor: z.string().min(1).optional(),
  brand: z.string().min(1).optional(),
  requisitionRequestDocumentUrl: z.string().url().optional(),
  requiredBy: z.string().datetime(),
  reason: z.string().min(1),
  projectId: z.string().uuid(),
});

export const updateRawMaterialPurchaseRequestBodySchema = z.object({
  // date: z.string().datetime().optional(),
  type: z.enum(['IMPORT', 'LOCAL']).optional(),
  productId: z.string().uuid().optional(),
  productGradeId: z.string().uuid().optional(),
  quantity: z.number().positive().optional(),
  uomId: z.string().uuid().optional(),
  vendor: z.string().min(1).optional(),
  brand: z.string().min(1).optional(),
  requisitionRequestDocumentUrl: z.string().url().optional(),
  requiredBy: z.string().datetime().optional(),
  reason: z.string().min(1).optional(),
  projectId: z.string().uuid().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export const listRawMaterialPurchaseRequestsQuerySchema =
  paginationQuerySchema.extend({
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
    searchKey: z.string().optional(),
    type: z.enum(['IMPORT', 'LOCAL']).optional(),
    approvalStatus: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
    productId: z.string().uuid().optional(),
    projectId: z.string().uuid().optional(),
  });

export const rawMaterialPurchaseRequestIdParamsSchema = idParamSchema;

export const approveRejectBodySchema = z.object({
  ids: z.union([z.string().uuid(), z.array(z.string().uuid()).min(1)]),
  approvalStatus: z.enum(['APPROVED', 'REJECTED']),
});
