import { z } from 'zod';
import { paginationQuerySchema } from '../../common/common.validator.js';

export const createDispatchBodySchema = z.object({
  vehicleId: z.string().uuid(),
  journeyScheduleId: z.string().uuid(),
  description: z.string().optional(),
  actualFuelValue: z.number().nonnegative(),
  journeyStatus: z.string().min(1),
});

export const listDispatchesQuerySchema = paginationQuerySchema;

export type CreateDispatchData = z.infer<typeof createDispatchBodySchema>;
