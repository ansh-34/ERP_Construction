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

export const createProjectBody = z.object({
  name: jsonObject,
  description: singleLineDescription.nullable().optional(),
  budget: nonNegativeNumber,
  spent: nonNegativeNumber.optional(),
  expectedStartDate: dateString.optional(),
  expectedEndDate: dateString.optional(),
  actualStartDate: createOnlyActualDate,
  actualEndDate: createOnlyActualDate,
  locationId: z.string().trim().min(1, { message: 'Location id is required' }),
  status: z.nativeEnum(StatusEnum).optional(),
  projectStages: z
    .array(
      z.object({
        name: jsonObject,
        description: singleLineDescription.nullable().optional(),
        progress: nonNegativeNumber.nullable().optional(),
        expectedStartDate: dateString.optional(),
        expectedEndDate: dateString.optional(),
        actualStartDate: createOnlyActualDate,
        actualEndDate: createOnlyActualDate,
        status: z.nativeEnum(StatusEnum).optional(),
      }),
    )
    .optional(),
});

export const updateProjectBody = z
  .object({
    name: jsonObject.optional(),
    description: singleLineDescription.nullable().optional(),
    budget: nonNegativeNumber.optional(),
    spent: nonNegativeNumber.optional(),
    expectedStartDate: lockedExpectedDate,
    expectedEndDate: lockedExpectedDate,
    actualStartDate: dateString.nullable().optional(),
    actualEndDate: dateString.nullable().optional(),
    locationId: z.string().trim().min(1).optional(),
    status: z.nativeEnum(StatusEnum).optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.description !== undefined ||
      data.budget !== undefined ||
      data.spent !== undefined ||
      data.actualStartDate !== undefined ||
      data.actualEndDate !== undefined ||
      data.locationId !== undefined ||
      data.status !== undefined,
    { message: 'At least one field is required' },
  );

export const domainIdQuery = z.object({
  domainId: z.string().trim().min(1, { message: 'Domain id is required' }),
  searchKey: z.string().trim().optional(),
  offset: z.string().trim().optional(),
  limit: z.string().trim().optional(),
});

export const idParams = z.object({
  id: z.string().trim().min(1, { message: 'Id is required' }),
});
