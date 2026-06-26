import { StatusEnum } from '@constants/index';
import { z } from 'zod';

const positiveNumber = z
  .number()
  .finite()
  .positive({ message: 'Value must be greater than 0' });
const nonNegativeNumber = z
  .number()
  .finite()
  .nonnegative({ message: 'Value must be non-negative' });
const dateString = z.string().trim().min(1);

const assignmentRowSchema = z.object({
  projectId: z.string().trim().min(1, { message: 'Project id is required' }),
  userId: z.string().trim().min(1, { message: 'User id is required' }),
  startDate: dateString,
  endDate: dateString,
  dailyWorkingHours: positiveNumber,
  dayCharge: nonNegativeNumber,
  notes: z.string().trim().nullable().optional(),
  status: z.nativeEnum(StatusEnum).optional(),
});

export const createProjectUserAssignmentBody = z
  .array(assignmentRowSchema)
  .min(1, { message: 'At least one assignment is required' });

export const updateProjectUserAssignmentBody = z
  .object({
    startDate: dateString.optional(),
    endDate: dateString.optional(),
    dailyWorkingHours: positiveNumber.optional(),
    dayCharge: nonNegativeNumber.optional(),
    notes: z.string().trim().nullable().optional(),
    status: z.nativeEnum(StatusEnum).optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'At least one field is required',
  });

export const listProjectUserAssignmentQuery = z.object({
  projectId: z.string().trim().min(1).optional(),
  userId: z.string().trim().min(1).optional(),
  startDate: z.string().trim().min(1).optional(),
  endDate: z.string().trim().min(1).optional(),
  currentDate: z.string().trim().min(1).optional(),
  searchKey: z.string().trim().optional(),
  userTypeCode: z.string().trim().min(1).optional(),
  userTypeId: z.string().trim().uuid().optional(),
  offset: z.string().trim().optional(),
  limit: z.string().trim().optional(),
});

export const availabilityProjectUserAssignmentQuery = z.object({
  date: z.string().trim().min(1, { message: 'Date is required' }),
  projectId: z.string().trim().min(1).optional(),
  userId: z.string().trim().min(1).optional(),
});

export const idParams = z.object({
  id: z.string().trim().min(1, { message: 'Id is required' }),
});
