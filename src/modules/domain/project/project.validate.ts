import { StatusEnum } from '@constants/index';
import { z } from 'zod';

const jsonObject = z.record(z.string(), z.unknown());
const nonNegativeNumber = z
  .number()
  .finite()
  .nonnegative({ message: 'Value must be non-negative' });

export const createProjectBody = z.object({
  name: jsonObject,
  projectCategoryId: z
    .string()
    .trim()
    .min(1, { message: 'Project category id is required' }),
  description: jsonObject.nullable().optional(),
  budget: nonNegativeNumber,
  spent: nonNegativeNumber.optional(),
  locationId: z.string().trim().min(1, { message: 'Location id is required' }),
  domainId: z.string().trim().min(1, { message: 'Domain id is required' }),
  status: z.nativeEnum(StatusEnum).optional(),
});

export const updateProjectBody = z
  .object({
    name: jsonObject.optional(),
    description: jsonObject.nullable().optional(),
    budget: nonNegativeNumber.optional(),
    spent: nonNegativeNumber.optional(),
    status: z.nativeEnum(StatusEnum).optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.description !== undefined ||
      data.budget !== undefined ||
      data.spent !== undefined ||
      data.status !== undefined,
    { message: 'At least one field is required' },
  );

export const domainIdQuery = z.object({
  domainId: z.string().trim().min(1, { message: 'Domain id is required' }),
});

export const idParams = z.object({
  id: z.string().trim().min(1, { message: 'Id is required' }),
});
