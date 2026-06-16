import { StatusEnum } from '@constants/index';
import { z } from 'zod';

const assetType = z.enum(['VEHICLE', 'MACHINERY']);
const movementType = z.enum([
  'WAREHOUSE',
  'WAREHOUSE_TO_SITE',
  'SITE_TO_WAREHOUSE',
  'PROJECT_SITE',
  'SITE_TO_SITE',
  'OTHER',
]);

// Frontend sends unused ids as "" — coerce empty strings to null
const optionalUuid = z.preprocess(
  (val) => (val === '' ? null : val),
  z.string().trim().uuid().nullable().optional(),
);

export const createMovementLogBody = z.object({
  code: z.string().trim().min(1, { message: 'Code is required' }),
  movementType,
  assetType,
  vehicleId: optionalUuid,
  machineryId: optionalUuid,
  projectId: optionalUuid,
  fromLocation: z.string().trim().min(1).nullable().optional(),
  toLocation: z.string().trim().min(1).nullable().optional(),
  startDateTime: z
    .string()
    .trim()
    .min(1, { message: 'Start date time is required' }),
  endDateTime: z
    .string()
    .trim()
    .min(1, { message: 'End date time is required' }),
  startMeterReading: z.number().nonnegative().nullable().optional(),
  endMeterReading: z.number().nonnegative().nullable().optional(),
  notes: z.string().trim().nullable().optional(),
  status: z.nativeEnum(StatusEnum).optional(),
});

export const listMovementLogQuery = z.object({
  assetType: assetType.optional(),
  movementType: movementType.optional(),
  vehicleId: z.string().trim().uuid().optional(),
  machineryId: z.string().trim().uuid().optional(),
  projectId: z.string().trim().uuid().optional(),
  searchKey: z.string().trim().optional(),
  fromDate: z.string().trim().min(1).optional(),
  toDate: z.string().trim().min(1).optional(),
  offset: z.string().trim().optional(),
  limit: z.string().trim().optional(),
});

export const idParams = z.object({
  id: z.string().trim().uuid({ message: 'Valid id is required' }),
});
