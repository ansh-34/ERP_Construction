import { z } from 'zod';
import {
  paginationQuerySchema,
  statusFilterSchema,
} from '../../common/common.validator.js';

export const createVehicleBodySchema = z.object({
  numberPlate: z.string().min(1),
  vehicleType: z.string().min(1),
  loadCapacity: z.number().positive(),
  loadCapacityUomId: z.string().uuid(),
  alertLoadThreshold: z.number().nonnegative(),
});

export const updateVehicleBodySchema = z.object({
  id: z.string().uuid(),
  numberPlate: z.string().min(1).optional(),
  vehicleType: z.string().min(1).optional(),
  loadCapacity: z.number().positive().optional(),
  loadCapacityUomId: z.string().uuid().optional(),
  alertLoadThreshold: z.number().nonnegative().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export const listVehiclesQuerySchema = paginationQuerySchema
  .merge(statusFilterSchema)
  .extend({
    searchKey: z.string().optional(),
  });

export type CreateVehicleData = z.infer<typeof createVehicleBodySchema>;
export type UpdateVehicleData = z.infer<typeof updateVehicleBodySchema>;
