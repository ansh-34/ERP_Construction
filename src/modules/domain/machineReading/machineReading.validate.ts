import { StatusEnum } from '@constants/index';
import { z } from 'zod';

const nonNegativeNumber = z
  .number()
  .finite()
  .nonnegative({ message: 'Value must be non-negative' });

const timeString = z
  .string()
  .trim()
  .regex(/^(?:[01]\d|2[0-3]):[0-5]\d(?:[:][0-5]\d(?:\.\d{1,3})?)?$/, {
    message: 'Invalid time format',
  });
const optionalReading = z
  .union([nonNegativeNumber, z.string().trim()])
  .optional();

export const createMachineReadingBody = z.object({
  date: z.string().trim().min(1, { message: 'Date is required' }),
  refillFuelStock: optionalReading,
  currentMachineReading: optionalReading,
  fuelRefillQuantity: nonNegativeNumber.optional(),
  machineStartTime: timeString,
  projectId: z.string().trim().min(1, { message: 'Project id is required' }),
  status: z.nativeEnum(StatusEnum).optional(),
});

export const updateMachineReadingBody = z.object({
  closingFuelStock: nonNegativeNumber,
  fuelRefillQuantity: nonNegativeNumber.optional(),
  machineEndTime: timeString,
  status: z.nativeEnum(StatusEnum).optional(),
});

export const endMachineReadingBody = z.object({
  machineEndTime: timeString,
});

export const listMachineReadingQuery = z.object({
  domainId: z.string().trim().min(1, { message: 'Domain id is required' }),
  projectId: z.string().trim().min(1).optional(),
  searchKey: z.string().trim().optional(),
});

export const domainIdQuery = z.object({
  domainId: z.string().trim().min(1).optional(),
  searchKey: z.string().trim().optional(),
});

export const idParams = z.object({
  id: z.string().trim().min(1, { message: 'Id is required' }),
});
