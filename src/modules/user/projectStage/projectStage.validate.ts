import { StatusEnum } from '@constants/index';
import { z } from 'zod';

const jsonObject = z.record(z.string(), z.unknown());
const singleLineDescription = z
  .string()
  .trim()
  .refine((value) => !/[\r\n]/.test(value), {
    message: 'Description must be single-line',
  });
const nonNegativeNumber = z
  .number()
  .finite()
  .nonnegative({ message: 'Value must be non-negative' });
const dateString = z.string().trim().min(1);
const lockedExpectedDate = z
  .never({ invalid_type_error: 'Expected dates cannot be updated' })
  .optional();
const createOnlyActualDate = z
  .never({ invalid_type_error: 'Actual dates can only be set during update' })
  .optional();

export const createProjectStageBody = z.object({
  name: jsonObject,
  description: singleLineDescription.nullable().optional(),
  progress: nonNegativeNumber.nullable().optional(),
  expectedStartDate: dateString.optional(),
  expectedEndDate: dateString.optional(),
  actualStartDate: createOnlyActualDate,
  actualEndDate: createOnlyActualDate,
  status: z.nativeEnum(StatusEnum).optional(),
});

export const updateProjectStageBody = z
  .object({
    name: jsonObject.optional(),
    description: singleLineDescription.nullable().optional(),
    progress: nonNegativeNumber.nullable().optional(),
    expectedStartDate: lockedExpectedDate,
    expectedEndDate: lockedExpectedDate,
    actualStartDate: dateString.nullable().optional(),
    actualEndDate: dateString.nullable().optional(),
    status: z.nativeEnum(StatusEnum).optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.description !== undefined ||
      data.progress !== undefined ||
      data.actualStartDate !== undefined ||
      data.actualEndDate !== undefined ||
      data.status !== undefined,
    { message: 'At least one field is required' },
  );

export const listProjectStageQuery = z.object({
  searchKey: z.string().trim().optional(),
  search: z.string().trim().optional(),
  keyword: z.string().trim().optional(),
  q: z.string().trim().optional(),
  offset: z.string().trim().optional(),
  limit: z.string().trim().optional(),
});

export const idParams = z.object({
  id: z.string().trim().min(1, { message: 'Id is required' }),
});
