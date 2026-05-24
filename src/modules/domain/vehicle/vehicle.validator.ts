import { z } from 'zod';
import { paginationQuerySchema } from '../../common/common.validator.js';

export const createVehicleBodySchema = z.object({
  numberPlate: z.string().min(1),
  vehicleType: z.string().min(1),
  loadCapacity: z.number().positive(),
  loadCapacityUomId: z.string().uuid(),
  alertLoadThreshold: z.number().nonnegative(),
});

export const listVehiclesQuerySchema = paginationQuerySchema;

export type CreateVehicleData = z.infer<typeof createVehicleBodySchema>;
