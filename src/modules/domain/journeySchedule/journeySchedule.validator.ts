import { z } from 'zod';
import { paginationQuerySchema } from '../../common/common.validator.js';

export const createJourneyScheduleBodySchema = z.object({
  truckId: z.string().uuid(),
  description: z.string().optional(),
  date: z.string().min(1),
  driverName: z.string().min(1),
  startLocation: z.string().min(1),
  endLocation: z.string().min(1),
  distance: z.number().nonnegative(),
  average: z.number().nonnegative(),
  expectedFuelValue: z.number().nonnegative(),
  fuelAlertThreshold: z.number().nonnegative(),
  loadedQuantity: z.number().nonnegative().optional(),
  loadedQuantityUomId: z.string().uuid().optional(),
  loadedAt: z.string().min(1),
  loadingStatus: z.string().min(1),
});

export const listJourneySchedulesQuerySchema = paginationQuerySchema;

export type CreateJourneyScheduleData = z.infer<
  typeof createJourneyScheduleBodySchema
>;
