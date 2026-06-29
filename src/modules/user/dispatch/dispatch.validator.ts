import { z } from 'zod';
import { paginationQuerySchema } from '../../common/common.validator.js';

export const createDispatchBodySchema = z.object({
  vehicleId: z.string().uuid(),
  journeyScheduleId: z.string().uuid(),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
  description: z.string().optional(),
  actualFuelValue: z.number().nonnegative(),
  emptyVehicleWeight: z.number().nonnegative().optional(),
  loadedVehicleWeight: z.number().nonnegative().optional(),
  vehicleWeightUomId: z.string().uuid().optional(),
  journeyStatus: z.string().min(1),
});

export const listDispatchesQuerySchema = paginationQuerySchema;

export type CreateDispatchData = z.infer<typeof createDispatchBodySchema>;
