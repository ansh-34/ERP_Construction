import { z } from 'zod';
import { paginationQuerySchema } from '../../common/common.validator.js';

export const createVehicleBodySchema = z.object({
  numberPlate: z.string().min(1),
  vehicleType: z.string().optional(),
  loadCapacity: z.number().optional(),
  loadCapacityUomId: z.string().optional(),
  alertLoadThreshold: z.number().optional(),
});

export const listVehiclesQuerySchema = paginationQuerySchema;

export type CreateVehicleData = z.infer<typeof createVehicleBodySchema>;
