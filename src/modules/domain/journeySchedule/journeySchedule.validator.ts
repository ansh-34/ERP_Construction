import { z } from 'zod';
import { paginationQuerySchema } from '../../common/common.validator.js';

export const createJourneyScheduleBodySchema = z.object({
  truckId: z.string().min(1),
  code: z.string().min(1),
  description: z.string().optional(),
  date: z.string().optional(),
  driverName: z.string().optional(),
  startLocation: z.string().optional(),
  endLocation: z.string().optional(),
  distance: z.number().optional(),
  average: z.number().optional(),
  expectedFuelValue: z.number().optional(),
  fuelAlertThreshold: z.number().optional(),
  loadedQuantity: z.number().optional(),
  loadedQuantityUomId: z.string().optional(),
  loadedAt: z.string().optional(),
  loadingStatus: z.string().optional(),
});

export const listJourneySchedulesQuerySchema = paginationQuerySchema;

export type CreateJourneyScheduleData = z.infer<
  typeof createJourneyScheduleBodySchema
>;
