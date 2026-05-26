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
const approvalAction = z.enum([
  'APPROVED',
  'REJECTED',
  'APPROVAL',
  'REJECTION',
]);
const idsSchema = z.union([
  z.string().trim().min(1, { message: 'Id is required' }),
  z.array(z.string().trim().min(1, { message: 'Id is required' })).min(1),
]);

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

export const submitProjectTaskBody = z.object({
  taskId: z.string().trim().min(1, { message: 'Task id is required' }),
  userId: z.string().trim().min(1, { message: 'User id is required' }),
  actualEndDate: dateString,
  taskProgress: nonNegativeNumber.max(100).optional(),
  images: z
    .array(
      z.object({
        imageId: z
          .string()
          .trim()
          .uuid({ message: 'Valid image id is required' }),
        description: singleLineDescription.nullable().optional(),
      }),
    )
    .optional(),
});

export const listProjectTaskSubmissionQuery = z.object({
  projectId: z.string().trim().min(1).optional(),
  stageId: z.string().trim().min(1).optional(),
  taskId: z.string().trim().min(1).optional(),
  userId: z.string().trim().min(1).optional(),
  approvalState: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
  searchKey: z.string().trim().optional(),
  offset: z.string().trim().optional(),
  limit: z.string().trim().optional(),
});

export const projectTaskSubmissionActionBody = z
  .object({
    ids: idsSchema,
    action: approvalAction.optional(),
    approvalState: approvalAction.optional(),
  })
  .refine(
    (data) => data.action !== undefined || data.approvalState !== undefined,
    {
      message: 'Action is required',
    },
  );

export const projectTaskDelayActionBody = z
  .object({
    ids: idsSchema,
    action: approvalAction.optional(),
    approvalState: approvalAction.optional(),
  })
  .refine(
    (data) => data.action !== undefined || data.approvalState !== undefined,
    {
      message: 'Action is required',
    },
  );

export const idParams = z.object({
  id: z.string().trim().min(1, { message: 'Id is required' }),
});
