import { z } from 'zod';
import {
  idParamSchema,
  paginationQuerySchema,
} from '../../common/common.validator.js';

export const listMachineryInventoryQuery = paginationQuerySchema.extend({
  machineId: z.string().trim().uuid().optional(),
  uomId: z.string().trim().uuid().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  searchKey: z.string().trim().optional(),
});

export const machineryInventoryIdParams = idParamSchema;
