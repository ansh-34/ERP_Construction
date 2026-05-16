import { StatusEnum } from '@constants/index';
import { z } from 'zod';

const jsonObject = z.record(z.string(), z.unknown());

export const createProjectCategoryBody = z.object({
  name: jsonObject,
  description: jsonObject.nullable().optional(),
  parentCategoryId: z
    .string()
    .trim()
    .min(1, { message: 'Parent category id is required' })
    .nullable()
    .optional(),
  domainId: z.string().trim().min(1, { message: 'Domain id is required' }),
  status: z.nativeEnum(StatusEnum).optional(),
});

export const updateProjectCategoryBody = z
  .object({
    name: jsonObject.optional(),
    description: jsonObject.nullable().optional(),
    parentCategoryId: z
      .string()
      .trim()
      .min(1, { message: 'Parent category id is required' })
      .nullable()
      .optional(),
    status: z.nativeEnum(StatusEnum).optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.description !== undefined ||
      data.parentCategoryId !== undefined ||
      data.status !== undefined,
    { message: 'At least one field is required' },
  );

export const domainIdQuery = z.object({
  domainId: z.string().trim().min(1, { message: 'Domain id is required' }),
  searchKey: z.string().trim().optional(),
});

export const idParams = z.object({
  id: z.string().trim().min(1, { message: 'Id is required' }),
});
