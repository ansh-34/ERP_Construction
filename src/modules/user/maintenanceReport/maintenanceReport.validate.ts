import { z } from 'zod';

export const maintenanceReportQuery = z.object({
  groupBy: z.enum(['WEEK', 'MONTH', 'YEAR']).optional(),
  assetType: z.enum(['VEHICLE', 'MACHINERY']).optional(),
  vehicleId: z.string().trim().uuid().optional(),
  machineryId: z.string().trim().uuid().optional(),
  fromDate: z.string().trim().min(1).optional(),
  toDate: z.string().trim().min(1).optional(),
});
