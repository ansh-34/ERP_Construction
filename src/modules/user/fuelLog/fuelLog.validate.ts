import { z } from 'zod';
import {
  idParamSchema,
  paginationQuerySchema,
} from '../../common/common.validator.js';

const fuelType = z.enum(['PETROL', 'DIESEL']);
const fuelDirectionType = z.enum(['CONSUMED', 'FILLED']);
const equipmentCategory = z.enum(['VEHICLE', 'MACHINERY']);
const transactionType = z.enum(['REFILL', 'CONSUMED']);
const fuelEntityType = z.enum(['PROJECT_FUEL_TANK', 'VEHICLE', 'MACHINERY']);

export const createFuelLogBody = z
  .object({
    fuelType,
    equipmentUniqueId: z.string().trim().min(1).nullable().optional(),
    equipmentCategory: equipmentCategory.nullable().optional(),
    equipmentType: z.string().trim().min(1).nullable().optional(),
    date: z.string().trim().min(1, { message: 'date is required' }),
    fuelDirectionType: fuelDirectionType.optional(),
    transactionType,
    fuelEntityType,
    fuelQuantity: z.number().positive(),
    fuelUomId: z.string().trim().uuid(),
    projectId: z.string().trim().uuid().nullable().optional(),
    vehicleId: z.string().trim().uuid().nullable().optional(),
    machineryId: z.string().trim().uuid().nullable().optional(),
  })
  .superRefine((data, context) => {
    if (data.transactionType === 'CONSUMED' && !data.projectId) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['projectId'],
        message: 'projectId is required for fuel consumption',
      });
    }
  });

export const updateFuelLogBody = z
  .object({
    fuelType: fuelType.optional(),
    equipmentUniqueId: z.string().trim().min(1).nullable().optional(),
    equipmentCategory: equipmentCategory.nullable().optional(),
    equipmentType: z.string().trim().min(1).nullable().optional(),
    date: z.string().trim().min(1).optional(),
    fuelDirectionType: fuelDirectionType.optional(),
    transactionType: transactionType.optional(),
    fuelEntityType: fuelEntityType.optional(),
    fuelQuantity: z.number().positive().optional(),
    fuelUomId: z.string().trim().uuid().optional(),
    projectId: z.string().trim().uuid().optional(),
    vehicleId: z.string().trim().uuid().nullable().optional(),
    machineryId: z.string().trim().uuid().nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export const listFuelLogQuery = paginationQuerySchema.extend({
  fuelType: fuelType.optional(),
  equipmentCategory: equipmentCategory.optional(),
  fuelDirectionType: fuelDirectionType.optional(),
  transactionType: transactionType.optional(),
  fuelEntityType: fuelEntityType.optional(),
  equipmentUniqueId: z.string().trim().optional(),
  projectId: z.string().trim().uuid().optional(),
  fromDate: z.string().trim().optional(),
  toDate: z.string().trim().optional(),
  searchKey: z.string().trim().optional(),
});

export const fuelLogIdParamsSchema = idParamSchema;
