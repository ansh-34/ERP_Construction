import { StatusEnum } from '@constants/index';
import { z } from 'zod';

export const add = z.object({
  name: z
    .string({
      message: 'Domain name is required',
    })
    .min(3, {
      message: 'Domain name must be at least 3 characters long',
    }),
  email: z
    .string({
      message: 'Domain email is required',
    })
    .email({
      message: 'Email must be a valid email address',
    }),
  password: z
    .string({
      message: 'Password is required',
    })
    .min(6, {
      message: 'Password must be at least 6 characters long',
    }),
  roleId: z
    .string({
      message: 'Role id must be a valid string',
    })
    .uuid({
      message: 'Role id must be a valid UUID',
    })
    .optional(),
});

export const edit = z.object({
  id: z.string({
    message: 'Domain id is required',
  }),
});

export const editData = z.object({
  name: z
    .string({
      message: 'Domain name is required',
    })
    .min(3, {
      message: 'Domain name must be at least 3 characters long',
    })
    .optional(),

  status: z
    .nativeEnum(StatusEnum, {
      errorMap: () => ({
        message: `Status must be from ${Object.values(StatusEnum).join(', ')}`,
      }),
    })
    .optional(),
});

export const get = z.object({
  id: z.string({
    message: 'Domain id is required',
  }),
});

export const remove = z.object({
  id: z.string({
    message: 'Domain id is required',
  }),
});

export const list = z.object({
  limit: z
    .string()
    .min(1, {
      message: 'Limit must be greater than 0',
    })
    .optional(),

  offset: z
    .string()
    .min(0, {
      message: 'Offset must be greater than or equal to 0',
    })
    .optional(),

  searchKey: z.string().optional(),

  isEmailVerified: z.string().optional(),

  status: z
    .nativeEnum(StatusEnum, {
      errorMap: () => ({
        message: `Status must be from ${Object.values(StatusEnum).join(', ')}`,
      }),
    })
    .optional(),
});
