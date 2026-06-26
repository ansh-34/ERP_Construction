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
    invoiceType: z.enum(['PROFORMA', 'FINAL']).optional(),
    lifecycle: z.enum(['ACTIVE', 'VOID']).optional(),
  });

export const invoiceIdParamsSchema = idParamSchema;

export const exportInvoiceQuerySchema = z.object({
  exportType: z
    .enum(['EXCEL', 'excel'])
    .transform((value) => value.toUpperCase() as 'EXCEL'),
});

// --- Finalize a proforma invoice (full item-list replacement) ---

// The final invoice is built only from these items. Each line is uniquely
// identified by (productId, productGradeId, uomId). quantity and rate are required.
export const finalizeInvoiceBodySchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        productGradeId: z.string().uuid().nullish(),
        uomId: z.string().uuid(),
        quantity: z.number().positive('Quantity must be > 0'),
        rate: z.number().min(0, 'Rate must be >= 0'),
      }),
    )
    .min(1, 'At least one item is required'),
});

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
