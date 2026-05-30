import { z } from 'zod';

export const maintenanceReportQuery = z.object({
  domainId: z.string().trim().min(1, { message: 'Domain id is required' }),
  groupBy: z.enum(['WEEK', 'MONTH', 'YEAR']).optional(),
  assetType: z.enum(['VEHICLE', 'MACHINERY']).optional(),
  vehicleId: z.string().trim().uuid().optional(),
  machineryId: z.string().trim().uuid().optional(),
  fromDate: z.string().trim().min(1).optional(),
  toDate: z.string().trim().min(1).optional(),
});
