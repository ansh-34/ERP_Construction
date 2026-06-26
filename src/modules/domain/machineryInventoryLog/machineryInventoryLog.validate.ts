import { z } from 'zod';
import {
  idParamSchema,
  paginationQuerySchema,
} from '../../common/common.validator.js';

const transactionType = z.enum(['INWARD', 'OUTWARD']);

export const createMachineryInventoryLogBody = z.object({
  date: z.string().trim().min(1, { message: 'date is required' }),
  transactionType,
  name: z.string().trim().min(1, { message: 'name is required' }),
  notes: z.string().trim().nullable().optional(),
  quantity: z.number().positive(),
  restockLevel: z.number().nonnegative().optional(),
  machineryInventoryId: z.string().trim().uuid().optional(),
  machineId: z.string().trim().uuid(),
  uomId: z.string().trim().uuid(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export const updateMachineryInventoryLogBody = z
  .object({
    date: z.string().trim().min(1).optional(),
    transactionType: transactionType.optional(),
    name: z.string().trim().min(1).optional(),
    notes: z.string().trim().nullable().optional(),
    quantity: z.number().positive().optional(),
    restockLevel: z.number().nonnegative().optional(),
    machineryInventoryId: z.string().trim().uuid().optional(),
    machineId: z.string().trim().uuid().optional(),
    uomId: z.string().trim().uuid().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export const listMachineryInventoryLogQuery = paginationQuerySchema.extend({
  machineryInventoryId: z.string().trim().uuid().optional(),
  machineId: z.string().trim().uuid().optional(),
  uomId: z.string().trim().uuid().optional(),
  transactionType: transactionType.optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  searchKey: z.string().trim().optional(),
  fromDate: z.string().trim().optional(),
  toDate: z.string().trim().optional(),
});

export const machineryInventoryLogIdParams = idParamSchema;
