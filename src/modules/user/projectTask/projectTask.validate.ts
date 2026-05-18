import { StatusEnum } from '@constants/index';
import { z } from 'zod';

const jsonObject = z.record(z.string(), z.unknown());
const nonNegativeNumber = z
  .number()
  .finite()
  .nonnegative({ message: 'Value must be non-negative' });
const optionalDate = z.string().trim().min(1).nullable().optional();
const nonEmptyOptionalString = z.string().trim().min(1).nullable().optional();

export const createProjectTaskBody = z.object({
  name: jsonObject,
  assignee: z.string().trim().min(1).nullable().optional(),
  plannedStartDate: optionalDate,
  plannedEndDate: optionalDate,
  actualStartDate: optionalDate,
  actualEndDate: optionalDate,
  taskStatus: z.string().trim().min(1).optional(),
  taskProgress: nonNegativeNumber.optional(),
  totalDelayInDays: nonNegativeNumber.optional(),
  requiredApproval: z.boolean().optional(),
  lastApprovedDeadline: optionalDate,
  projectBatchCode: nonEmptyOptionalString,
  stageId: z.string().trim().min(1, { message: 'Stage id is required' }),
  projectId: z.string().trim().min(1, { message: 'Project id is required' }),
  status: z.nativeEnum(StatusEnum).optional(),
});

export const updateProjectTaskBody = z
  .object({
    name: jsonObject.optional(),
    assignee: z.string().trim().min(1).nullable().optional(),
    plannedStartDate: optionalDate,
    plannedEndDate: optionalDate,
    actualStartDate: optionalDate,
    actualEndDate: optionalDate,
    taskStatus: z.string().trim().min(1).optional(),
    taskProgress: nonNegativeNumber.optional(),
    totalDelayInDays: nonNegativeNumber.optional(),
    requiredApproval: z.boolean().optional(),
    lastApprovedDeadline: optionalDate,
    projectBatchCode: nonEmptyOptionalString,
    status: z.nativeEnum(StatusEnum).optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'At least one field is required',
  });

export const listProjectTaskQuery = z.object({
  projectId: z.string().trim().min(1).optional(),
  stageId: z.string().trim().min(1).optional(),
  searchKey: z.string().trim().optional(),
});

export const idParams = z.object({
  id: z.string().trim().min(1, { message: 'Id is required' }),
});
