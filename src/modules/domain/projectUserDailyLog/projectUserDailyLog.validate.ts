import { AttendanceStatusEnum, StatusEnum } from '@constants/index';
import { z } from 'zod';

const nonNegativeNumber = z
  .number()
  .finite()
  .nonnegative({ message: 'Value must be non-negative' });
const dateString = z.string().trim().min(1);

const dailyLogRowSchema = z.object({
  date: dateString,
  projectId: z.string().trim().min(1, { message: 'Project id is required' }),
  userId: z.string().trim().min(1, { message: 'User id is required' }),
  startTime: dateString.nullable().optional(),
  endTime: dateString.nullable().optional(),
  totalWorkingHours: nonNegativeNumber.optional(),
  dayCharge: nonNegativeNumber,
  attendanceStatus: z.nativeEnum(AttendanceStatusEnum).optional(),
  notes: z.string().trim().nullable().optional(),
  status: z.nativeEnum(StatusEnum).optional(),
});

export const createProjectUserDailyLogBody = z.array(dailyLogRowSchema).min(1);

export const updateProjectUserDailyLogBody = z
  .object({
    date: dateString.optional(),
    startTime: dateString.nullable().optional(),
    endTime: dateString.nullable().optional(),
    totalWorkingHours: nonNegativeNumber.optional(),
    dayCharge: nonNegativeNumber.optional(),
    attendanceStatus: z.nativeEnum(AttendanceStatusEnum).optional(),
    notes: z.string().trim().nullable().optional(),
    status: z.nativeEnum(StatusEnum).optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'At least one field is required',
  });

export const listProjectUserDailyLogQuery = z.object({
  projectId: z.string().trim().min(1).optional(),
  userId: z.string().trim().min(1).optional(),
  date: z.string().trim().min(1).optional(),
  startDate: z.string().trim().min(1).optional(),
  endDate: z.string().trim().min(1).optional(),
  searchKey: z.string().trim().optional(),
  offset: z.string().trim().optional(),
  limit: z.string().trim().optional(),
});

export const idParams = z.object({
  id: z.string().trim().min(1, { message: 'Id is required' }),
});
