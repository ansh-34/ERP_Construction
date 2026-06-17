import { z } from 'zod';

// Accepts ?domainIds=a,b,c OR repeated ?domainIds=a&domainIds=b; omitted => all domains.
const domainIdsSchema = z.preprocess(
  (value) => {
    if (value === undefined || value === null) return undefined;
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      return value
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean);
    }
    return value;
  },
  z.array(z.string().uuid('Invalid domain ID')).optional(),
);

const domainScope = {
  domainIds: domainIdsSchema,
  search: z.string().trim().min(1).optional(),
};

const exportFlag = { export: z.literal('xlsx').optional() };

export const projectSummaryQuerySchema = z.object({
  ...domainScope,
  country: z.string().optional(),
  projectId: z.string().uuid().optional(),
});

export const projectSummaryExportQuerySchema = z.object({
  ...domainScope,
  ...exportFlag,
  country: z.string().optional(),
  projectId: z.string().uuid().optional(),
});

export const projectUserTaskQuerySchema = z.object({
  ...domainScope,
  projectId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
});

export const projectUserTaskExportQuerySchema = z.object({
  ...domainScope,
  ...exportFlag,
  projectId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
});

export const machineSummaryQuerySchema = z.object({
  ...domainScope,
  projectId: z.string().uuid().optional(),
  machineryId: z.string().uuid().optional(),
});

export const machineSummaryExportQuerySchema = z.object({
  ...domainScope,
  ...exportFlag,
  projectId: z.string().uuid().optional(),
  machineryId: z.string().uuid().optional(),
  vehicleId: z.string().uuid().optional(),
});

export const productInventoryQuerySchema = z.object({
  ...domainScope,
  ...exportFlag,
  productId: z.string().uuid().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export const vendorPurchaseHistoryQuerySchema = z.object({
  ...domainScope,
  ...exportFlag,
  vendorId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
});

export const productTransactionHistoryQuerySchema = z.object({
  ...domainScope,
  ...exportFlag,
  productId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});
