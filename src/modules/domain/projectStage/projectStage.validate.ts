import { StatusEnum } from '@constants/index';
import { z } from 'zod';

const jsonObject = z.record(z.string(), z.unknown());
const nonNegativeNumber = z
  .number()
  .finite()
  .nonnegative({ message: 'Value must be non-negative' });

export const createProjectStageBody = z.object({
  name: jsonObject,
  description: jsonObject.nullable().optional(),
  progress: nonNegativeNumber.nullable().optional(),
  projectId: z.string().trim().min(1, { message: 'Project id is required' }),
  domainId: z.string().trim().min(1, { message: 'Domain id is required' }),
  status: z.nativeEnum(StatusEnum).optional(),
});

export const updateProjectStageBody = z
  .object({
    name: jsonObject.optional(),
    description: jsonObject.nullable().optional(),
    progress: nonNegativeNumber.nullable().optional(),
    status: z.nativeEnum(StatusEnum).optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.description !== undefined ||
      data.progress !== undefined ||
      data.status !== undefined,
    { message: 'At least one field is required' },
  );

export const listProjectStageQuery = z.object({
  domainId: z.string().trim().min(1, { message: 'Domain id is required' }),
  projectId: z.string().trim().min(1, { message: 'Project id is required' }),
  searchKey: z.string().trim().optional(),
});

export const domainIdQuery = z.object({
  domainId: z.string().trim().min(1, { message: 'Domain id is required' }),
  searchKey: z.string().trim().optional(),
});

export const idParams = z.object({
  id: z.string().trim().min(1, { message: 'Id is required' }),
});
