import { StatusEnum } from '@constants/index';
import { z } from 'zod';

const jsonObject = z.record(z.string(), z.unknown());

export const createLocationBody = z.object({
  name: jsonObject,
  code: z.string().trim().min(1).optional(),
  type: z.string().trim().min(1, { message: 'Type is required' }),
  parentLocationId: z
    .string()
    .trim()
    .min(1, { message: 'Parent location id is required' })
    .nullable()
    .optional(),
  status: z.nativeEnum(StatusEnum).optional(),
});

export const updateLocationBody = z
  .object({
    name: jsonObject.optional(),
    code: z.string().trim().min(1).optional(),
    type: z.string().trim().min(1, { message: 'Type is required' }).optional(),
    parentLocationId: z
      .string()
      .trim()
      .min(1, { message: 'Parent location id is required' })
      .nullable()
      .optional(),
    status: z.nativeEnum(StatusEnum).optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.code !== undefined ||
      data.type !== undefined ||
      data.parentLocationId !== undefined ||
      data.status !== undefined,
    { message: 'At least one field is required' },
  );

export const listLocationQuery = z.object({
  searchKey: z.string().trim().optional(),
  offset: z.string().trim().regex(/^\d+$/).optional(),
  limit: z.string().trim().regex(/^\d+$/).optional(),
});

export const idParams = z.object({
  id: z.string().trim().min(1, { message: 'Id is required' }),
});
