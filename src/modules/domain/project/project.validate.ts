import { StatusEnum } from '@constants/index';
import { z } from 'zod';

const jsonObject = z.record(z.string(), z.unknown());
const nonNegativeNumber = z
  .number()
  .finite()
  .nonnegative({ message: 'Value must be non-negative' });

export const createProjectBody = z.object({
  name: jsonObject,
  description: jsonObject.nullable().optional(),
  budget: nonNegativeNumber,
  spent: nonNegativeNumber.optional(),
  locationId: z.string().trim().min(1, { message: 'Location id is required' }),
  status: z.nativeEnum(StatusEnum).optional(),
  projectStages: z
    .array(
      z.object({
        name: jsonObject,
        description: jsonObject.nullable().optional(),
        progress: nonNegativeNumber.nullable().optional(),
        status: z.nativeEnum(StatusEnum).optional(),
      }),
    )
    .optional(),
});

export const updateProjectBody = z
  .object({
    name: jsonObject.optional(),
    description: jsonObject.nullable().optional(),
    budget: nonNegativeNumber.optional(),
    spent: nonNegativeNumber.optional(),
    locationId: z.string().trim().min(1).optional(),
    status: z.nativeEnum(StatusEnum).optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.description !== undefined ||
      data.budget !== undefined ||
      data.spent !== undefined ||
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
