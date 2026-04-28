import { StatusEnum } from '@constants/index';
import { z } from 'zod';

export const add = z.object({
  name: z
    .string({
      message: 'Permission name is required',
    })
    .min(3, { message: 'Permission name must be at least 3 characters long' }),
  code: z
    .string({
      message: 'Permission code is required',
    })
    .min(3, { message: 'Permission code must be at least 8 characters long' }),
});

export const edit = z.object({
  id: z.string({
    message: 'Permission id is required',
  }),
});

export const editData = z.object({
  name: z
    .string({
      message: 'Permission name is required',
    })
    .min(3, { message: 'Permission name must be at least 3 characters long' })
    .optional(),
  code: z
    .string({
      message: 'Permission code is required',
    })
    .min(3, { message: 'Permission code must be at least 8 characters long' })
    .optional(),
  status: z
    .nativeEnum(StatusEnum, {
      errorMap: () => ({
        message: `Status must be from ${Object.values(StatusEnum).join(', ')}`,
      }),
    })
    .optional(),
});

export const remove = z.object({
  id: z.string({
    message: 'Permission id is required',
  }),
});

export const list = z.object({
  limit: z
    .string()
    .min(1, { message: 'Limit must be greater than 0' })
    .optional(),
  offset: z
    .string()
    .min(0, { message: 'Offset must be greater than or equal to 0' })
    .optional(),
  searchKey: z.string().optional(),
  status: z
    .nativeEnum(StatusEnum, {
      errorMap: () => ({
        message: `Status must be from ${Object.values(StatusEnum).join(', ')}`,
      }),
    })
    .optional(),
});
