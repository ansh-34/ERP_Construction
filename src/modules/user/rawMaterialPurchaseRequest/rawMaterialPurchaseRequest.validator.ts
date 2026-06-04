import { z } from 'zod';
import { paginationQuerySchema } from '../../common/common.validator.js';

export const createRawMaterialPurchaseRequestBodySchema = z.object({
  type: z.enum(['IMPORT', 'LOCAL']),
  projectId: z.string().uuid(),
  requiredBy: z.string().datetime(),
  reason: z.string().optional(),
  documentId: z.string().uuid().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        productGradeId: z.string().uuid(),
        quantity: z.number().positive(),
        uomId: z.string().uuid(),
        brand: z.string().min(1).optional(),
      }),
    )
    .min(1, 'At least one item is required'),
});

export const updateRawMaterialPurchaseRequestBodySchema = z.object({
  // date: z.string().datetime().optional(),
  type: z.enum(['IMPORT', 'LOCAL']).optional(),
  productId: z.string().uuid().optional(),
  productGradeId: z.string().uuid().optional(),
  quantity: z.number().positive().optional(),
  uomId: z.string().uuid().optional(),
  brand: z.string().min(1).optional(),
  documentId: z.string().uuid().optional(),
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
    domainId: z.string().uuid().optional(),
    isDeleted: z.coerce.boolean().optional().default(false),
  });

export const rawMaterialPurchaseRequestIdParamsSchema = z.object({
  id: z.string().uuid({
    message: 'Invalid raw material purchase request ID format. Must be a UUID',
  }),
});

export const rawMaterialPurchaseRequestCodeParamsSchema = z.object({
  code: z.string().min(1),
});

export const updateRawMaterialPurchaseRequestByCodeParamsSchema = z.object({
  code: z.string().min(1),
  productId: z.string().uuid(),
});

export const approveRejectBodySchema = z.object({
  code: z.string().min(1),
  approvalStatus: z.enum(['APPROVED', 'REJECTED']),
});

// --- Purchase Order Schemas ---

export const listPurchaseOrdersQuerySchema = paginationQuerySchema.extend({
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  orderStatus: z.string().optional(),
  projectId: z.string().uuid().optional(),
  domainId: z.string().uuid().optional(),
  isDeleted: z.coerce.boolean().optional().default(false),
});

export const poIdParamsSchema = z.object({
  poId: z.string().uuid(),
});

export const poProductIdParamsSchema = z.object({
  poId: z.string().uuid(),
  productId: z.string().uuid(),
});

export const updatePurchaseOrderBodySchema = z.object({
  paymentTerms: z.string().optional(),
  orderStatus: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export const poProductsQuerySchema = z.object({
  poId: z.string().optional(),
  searchKey: z.string().optional(),
  offset: z.string().optional(),
  limit: z.string().optional(),
});
