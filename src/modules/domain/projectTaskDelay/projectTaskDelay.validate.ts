import { StatusEnum } from '@constants/index';
import { z } from 'zod';

const nonNegativeNumber = z
  .number()
  .finite()
  .nonnegative({ message: 'Value must be non-negative' });
const optionalDate = z.string().trim().min(1).nullable().optional();

export const createProjectTaskDelayBody = z.object({
  taskId: z.string().trim().min(1, { message: 'Task id is required' }),
  requestedDelayInDays: nonNegativeNumber,
  delayReason: z
    .string()
    .trim()
    .min(1, { message: 'Delay reason is required' }),
  requestApproved: z.boolean().optional(),
  requestApprovalTime: optionalDate,
  stageId: z.string().trim().min(1, { message: 'Stage id is required' }),
  projectId: z.string().trim().min(1, { message: 'Project id is required' }),
  domainId: z.string().trim().min(1, { message: 'Domain id is required' }),
  status: z.nativeEnum(StatusEnum).optional(),
});

export const updateProjectTaskDelayBody = z
  .object({
    requestedDelayInDays: nonNegativeNumber.optional(),
    delayReason: z.string().trim().min(1).optional(),
    requestApproved: z.boolean().optional(),
    requestApprovalTime: optionalDate,
    status: z.nativeEnum(StatusEnum).optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'At least one field is required',
  });

export const listProjectTaskDelayQuery = z.object({
  domainId: z.string().trim().min(1, { message: 'Domain id is required' }),
  projectId: z.string().trim().min(1).optional(),
  stageId: z.string().trim().min(1).optional(),
  taskId: z.string().trim().min(1).optional(),
  searchKey: z.string().trim().optional(),
  offset: z.string().trim().optional(),
  limit: z.string().trim().optional(),
});

export const domainIdQuery = z.object({
  domainId: z.string().trim().min(1, { message: 'Domain id is required' }),
  searchKey: z.string().trim().optional(),
});

export const idParams = z.object({
  id: z.string().trim().min(1, { message: 'Id is required' }),
});
