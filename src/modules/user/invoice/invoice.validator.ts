import { z } from 'zod';
import {
  idParamSchema,
  paginationQuerySchema,
  statusFilterSchema,
} from '../../common/common.validator.js';

export const listInvoicesQuerySchema = paginationQuerySchema
  .merge(statusFilterSchema)
  .extend({
    searchKey: z.string().optional(),
    vendorName: z.string().optional(),
    purchaseOrderId: z.string().uuid().optional(),
    projectId: z.string().uuid().optional(),
  });

export const invoiceIdParamsSchema = idParamSchema;

// --- Generate Invoices from PO using VendorProductPricing ---

export const poIdParamsSchema = z.object({
  poId: z.string().uuid(),
});

export const generateInvoicesBodySchema = z.object({
  assignments: z
    .array(
      z.object({
        purchaseOrderProductId: z.string().uuid(),
        vendorProductPricingId: z.string().uuid(),
      }),
    )
    .min(1, 'At least one vendor assignment is required'),
});

export const invoiceItemsQuerySchema = paginationQuerySchema.extend({
  invoiceId: z.string().optional(),
  searchKey: z.string().optional(),
});
