import { StatusEnum } from '@constants/index';
import { z } from 'zod';

const jsonObject = z.record(z.string(), z.unknown());
const assetType = z.enum(['VEHICLE', 'MACHINERY']);

export const createMaintenanceLogBody = z.object({
  code: z.string().trim().min(1, { message: 'Code is required' }),
  date: z.string().trim().min(1, { message: 'Date is required' }),
  description: jsonObject,
  assetType,
  vehicleId: z.string().trim().uuid().nullable().optional(),
  machineryId: z.string().trim().uuid().nullable().optional(),
  maintenanceScheduleId: z.string().trim().uuid().nullable().optional(),
  expenseAmount: z.number().nonnegative().optional(),
  meterReading: z.number().nonnegative().nullable().optional(),
  status: z.nativeEnum(StatusEnum).optional(),
});

export const listMaintenanceLogQuery = z.object({
  domainId: z.string().trim().min(1, { message: 'Domain id is required' }),
  assetType: assetType.optional(),
  vehicleId: z.string().trim().uuid().optional(),
  machineryId: z.string().trim().uuid().optional(),
  maintenanceScheduleId: z.string().trim().uuid().optional(),
  searchKey: z.string().trim().optional(),
  fromDate: z.string().trim().min(1).optional(),
  toDate: z.string().trim().min(1).optional(),
  offset: z.string().trim().optional(),
  limit: z.string().trim().optional(),
});

export const domainIdQuery = z.object({
  domainId: z.string().trim().min(1, { message: 'Domain id is required' }),
});

export const idParams = z.object({
  id: z.string().trim().uuid({ message: 'Valid id is required' }),
});
