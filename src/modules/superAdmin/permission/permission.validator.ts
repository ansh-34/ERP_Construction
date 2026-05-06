import { z } from 'zod';
import {
  idParamSchema,
  paginationQuerySchema,
} from '../../common/common.validator.js';

export const createPermissionBodySchema = z.object({
  name: z.any(),
  code: z.string().min(1),
});

export const listPermissionsQuerySchema = paginationQuerySchema;

export const permissionIdParamsSchema = idParamSchema;

export const updatePermissionBodySchema = z.object({
  name: z.any().optional(),
  code: z.string().min(1).optional(),
  status: z.string().optional(),
});

export type CreatePermissionData = z.infer<typeof createPermissionBodySchema>;
export type UpdatePermissionData = z.infer<typeof updatePermissionBodySchema>;
