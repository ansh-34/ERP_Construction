import { z } from 'zod';
import {
  idParamSchema,
  paginationQuerySchema,
  statusFilterSchema,
} from '../../common/common.validator.js';

export const createPermissionBodySchema = z.object({
  name: z
    .record(
      z.string().regex(/^[a-z]{2}$/, 'Invalid language code'),
      z.string().min(1, 'Translation cannot be empty'),
    )
    .refine((data) => !!data.en, {
      message: 'English (en) translation is required',
      path: ['en'],
    }),
});

export const listPermissionsQuerySchema = z.object({
  ...paginationQuerySchema.shape,
  ...statusFilterSchema.shape,
  searchKey: z.string().optional(),
});

export const permissionIdParamsSchema = idParamSchema;

export const updatePermissionBodySchema = z.object({
  name: z
    .record(
      z.string().regex(/^[a-z]{2}$/, 'Invalid language code'),
      z.string().min(1, 'Translation cannot be empty'),
    )
    .refine((data) => !!data.en, {
      message: 'English (en) translation is required',
      path: ['en'],
    })
    .optional(),
  status: statusFilterSchema.shape.status.optional(),
});

export type CreatePermissionData = z.infer<typeof createPermissionBodySchema>;
export type UpdatePermissionData = z.infer<typeof updatePermissionBodySchema>;
