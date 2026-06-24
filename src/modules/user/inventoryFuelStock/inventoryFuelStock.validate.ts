import { z } from 'zod';
import {
  idParamSchema,
  paginationQuerySchema,
} from '../../common/common.validator.js';

const fuelType = z.enum(['PETROL', 'DIESEL']);
const status = z.enum(['ACTIVE', 'INACTIVE']);

export const listInventoryFuelStockQuery = paginationQuerySchema.extend({
  fuelType: fuelType.optional(),
  uomId: z.string().trim().uuid().optional(),
  status: status.optional(),
  searchKey: z.string().trim().optional(),
});

export const inventoryFuelStockIdParams = idParamSchema;
