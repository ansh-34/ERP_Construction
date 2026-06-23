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
  average: z.number().nonnegative().optional(),
  expectedFuelValue: z.number().nonnegative().optional(),
  fuelAlertThreshold: z.number().nonnegative().optional(),
  loadedQuantity: z.number().nonnegative().optional(),
  loadedQuantityUomId: z.string().uuid().optional(),
  loadedAt: z.string().min(1),
  loadingStatus: z.string().min(1),
});

export const updateJourneyScheduleBodySchema = z.object({
  description: z.string().optional(),
  date: z.string().min(1).optional(),
  driverName: z.string().min(1).optional(),
  startLocation: z.string().min(1).optional(),
  endLocation: z.string().min(1).optional(),
  distance: z.number().nonnegative().optional(),
  average: z.number().nonnegative().optional(),
  expectedFuelValue: z.number().nonnegative().optional(),
  fuelAlertThreshold: z.number().nonnegative().optional(),
  loadedQuantity: z.number().nonnegative().optional(),
  loadedQuantityUomId: z.string().uuid().optional(),
  loadedAt: z.string().min(1).optional(),
  loadingStatus: z.string().min(1).optional(),
});

export const listJourneySchedulesQuerySchema = paginationQuerySchema;

export type CreateJourneyScheduleData = z.infer<
  typeof createJourneyScheduleBodySchema
>;
export type UpdateJourneyScheduleData = z.infer<
  typeof updateJourneyScheduleBodySchema
>;
