import { z } from 'zod';

export const movementReportQuery = z.object({
  assetType: z.enum(['VEHICLE', 'MACHINERY']).optional(),
  movementType: z
    .enum([
      'WAREHOUSE',
      'WAREHOUSE_TO_SITE',
      'SITE_TO_WAREHOUSE',
      'PROJECT_SITE',
      'SITE_TO_SITE',
      'OTHER',
    ])
    .optional(),
  vehicleId: z.string().trim().uuid().optional(),
  machineryId: z.string().trim().uuid().optional(),
  projectId: z.string().trim().uuid().optional(),
  fromDate: z.string().trim().min(1).optional(),
  toDate: z.string().trim().min(1).optional(),
});
