import { StatusEnum } from '@constants/index';
import { z } from 'zod';

const jsonObject = z.record(z.string(), z.unknown());
const assetType = z.enum(['VEHICLE', 'MACHINERY']);
const scheduleStatus = z.enum([
  'SCHEDULED',
  'OVERDUE',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
]);

export const createMaintenanceScheduleBody = z.object({
  code: z.string().trim().min(1, { message: 'Code is required' }),
  title: jsonObject,
  assetType,
  vehicleId: z.string().trim().uuid().nullable().optional(),
  machineryId: z.string().trim().uuid().nullable().optional(),
  nextDueDate: z
    .string()
    .trim()
    .min(1, { message: 'Next due date is required' }),
  scheduleStatus: scheduleStatus.optional(),
  status: z.nativeEnum(StatusEnum).optional(),
});

export const updateMaintenanceScheduleBody = z
  .object({
    code: z.string().trim().min(1).optional(),
    title: jsonObject.optional(),
    assetType: assetType.optional(),
    vehicleId: z.string().trim().uuid().nullable().optional(),
    machineryId: z.string().trim().uuid().nullable().optional(),
    nextDueDate: z.string().trim().min(1).optional(),
    scheduleStatus: scheduleStatus.optional(),
    status: z.nativeEnum(StatusEnum).optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'At least one field is required',
  });

export const advanceMaintenanceScheduleBody = z.object({
  nextDueDate: z
    .string()
    .trim()
    .min(1, { message: 'Next due date is required' }),
  scheduleStatus: scheduleStatus.optional(),
});

export const listMaintenanceScheduleQuery = z.object({
  assetType: assetType.optional(),
  scheduleStatus: scheduleStatus.optional(),
  vehicleId: z.string().trim().uuid().optional(),
  machineryId: z.string().trim().uuid().optional(),
  searchKey: z.string().trim().optional(),
  fromDate: z.string().trim().min(1).optional(),
  toDate: z.string().trim().min(1).optional(),
  offset: z.string().trim().optional(),
  limit: z.string().trim().optional(),
});

export const idParams = z.object({
  id: z.string().trim().uuid({ message: 'Valid id is required' }),
});
