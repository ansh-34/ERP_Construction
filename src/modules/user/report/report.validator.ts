import { z } from 'zod';

export const projectSummaryQuerySchema = z.object({
  country: z.string().trim().optional(),
  projectId: z.string().trim().uuid().optional(),
});

export const projectSummaryExportQuerySchema = projectSummaryQuerySchema.extend(
  {
    export: z.enum(['xlsx']),
  },
);

export const projectUserTaskQuerySchema = z.object({
  projectId: z.string().trim().uuid().optional(),
  userId: z.string().trim().uuid().optional(),
});

export const projectUserTaskExportQuerySchema =
  projectUserTaskQuerySchema.extend({
    export: z.enum(['xlsx']),
  });

export const machineSummaryQuerySchema = z.object({
  projectId: z.string().trim().uuid().optional(),
  machineryId: z.string().trim().uuid().optional(),
});

export const machineSummaryExportQuerySchema = machineSummaryQuerySchema.extend(
  {
    export: z.enum(['xlsx']),
    vehicleId: z.string().trim().uuid().optional(),
  },
);

export const productInventoryQuerySchema = z.object({
  productId: z.string().trim().uuid().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export const productInventoryExportQuerySchema =
  productInventoryQuerySchema.extend({
    export: z.enum(['xlsx']),
  });

export const vendorPurchaseHistoryQuerySchema = z.object({
  vendorId: z.string().trim().uuid().optional(),
  projectId: z.string().trim().uuid().optional(),
});

export const vendorPurchaseHistoryExportQuerySchema =
  vendorPurchaseHistoryQuerySchema.extend({
    export: z.enum(['xlsx']),
  });

export const productTransactionHistoryQuerySchema = z.object({
  productId: z.string().trim().uuid().optional(),
  projectId: z.string().trim().uuid().optional(),
  startDate: z.string().trim().optional(),
  endDate: z.string().trim().optional(),
});

export const productTransactionHistoryExportQuerySchema =
  productTransactionHistoryQuerySchema.extend({
    export: z.enum(['xlsx']),
  });
