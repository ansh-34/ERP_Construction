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
  uomId: z.string().uuid().optional(),
  rate: z.number().nonnegative().optional().default(0),
});

const invoiceGrnSchema = z.object({
  referenceType: z.literal('INVOICE'),
  invoiceId: z.string().uuid(),
  wbReference: z.string().optional(),
  grnProducts: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().positive(),
      }),
    )
    .min(1),
});

const poGrnSchema = z.object({
  referenceType: z.literal('PO'),
  purchaseOrderId: z.string().uuid(),
  vendorId: z.string().uuid(),
  wbReference: z.string().optional(),
  grnProducts: z
    .array(
      z.object({
        poProductId: z.string().uuid(),
        quantity: z.number().positive(),
        rate: z.number().nonnegative(),
        currencyId: z.string().uuid(),
      }),
    )
    .min(1),
});

const naGrnSchema = z.object({
  referenceType: z.literal('NA'),
  vendorId: z.string().uuid(),
  projectId: z.string().uuid().optional(),
  wbReference: z.string().optional(),
  grnProducts: z
    .array(
      z.object({
        productId: z.string().uuid(),
        productGradeId: z.string().uuid(),
        quantity: z.number().positive(),
        rate: z.number().nonnegative().default(0),
        uomId: z.string().uuid(),
        currencyId: z.string().uuid(),
      }),
    )
    .min(1),
});

export const createGrnBodySchema = z.discriminatedUnion('referenceType', [
  invoiceGrnSchema,
  poGrnSchema,
  naGrnSchema,
]);

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
    referenceType: z.enum(['INVOICE', 'PO', 'NA']).optional(),
  });

export const grnIdParamsSchema = idParamSchema;

export const exportGrnQuerySchema = z.object({
  exportType: z
    .enum(['EXCEL', 'excel'])
    .transform((value) => value.toUpperCase() as 'EXCEL'),
});

export const createGrnProductBodySchema = grnProductSchema;

export const updateGrnProductBodySchema = grnProductSchema.partial();

export const grnProductIdParamsSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
});
