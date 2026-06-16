import { z } from 'zod';
import {
  idParamSchema,
  paginationQuerySchema,
} from '../../common/common.validator.js';

const fuelType = z.enum(['PETROL', 'DIESEL']);
const fuelDirectionType = z.enum(['CONSUMED', 'FILLED']);
const equipmentCategory = z.enum(['VEHICLE', 'MACHINERY']);

export const createFuelLogBody = z.object({
  fuelType,
  equipmentUniqueId: z
    .string()
    .trim()
    .min(1, { message: 'equipmentUniqueId is required' }),
  equipmentCategory,
  equipmentType: z
    .string()
    .trim()
    .min(1, { message: 'equipmentType is required' }),
  date: z.string().trim().min(1, { message: 'date is required' }),
  fuelDirectionType,
  fuelValue: z.number().nonnegative(),
  fuelQuantity: z.number().nonnegative(),
  fuelUomId: z.string().trim().uuid(),
  projectId: z.string().trim().uuid().optional(),
});

export const updateFuelLogBody = z
  .object({
    fuelType: fuelType.optional(),
    equipmentUniqueId: z.string().trim().min(1).optional(),
    equipmentCategory: equipmentCategory.optional(),
    equipmentType: z.string().trim().min(1).optional(),
    date: z.string().trim().min(1).optional(),
    fuelDirectionType: fuelDirectionType.optional(),
    fuelValue: z.number().nonnegative().optional(),
    fuelQuantity: z.number().nonnegative().optional(),
    fuelUomId: z.string().trim().uuid().optional(),
    projectId: z.string().trim().uuid().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export const listFuelLogQuery = paginationQuerySchema.extend({
  fuelType: fuelType.optional(),
  equipmentCategory: equipmentCategory.optional(),
  fuelDirectionType: fuelDirectionType.optional(),
  equipmentUniqueId: z.string().trim().optional(),
  projectId: z.string().trim().uuid().optional(),
  fromDate: z.string().trim().optional(),
  toDate: z.string().trim().optional(),
  searchKey: z.string().trim().optional(),
});

export const fuelLogIdParamsSchema = idParamSchema;
