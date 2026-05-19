import { z } from 'zod';
import {
  idParamSchema,
  paginationQuerySchema,
  roleIdParamSchema,
  statusFilterSchema,
} from '../../common/common.validator.js';

const localizedName = z
  .record(
    z.string().regex(/^[a-z]{2}$/, 'Invalid language code'),
    z.string().min(1, 'Translation cannot be empty'),
  )
  .refine((data) => !!data.en, {
    message: 'English (en) translation is required',
    path: ['en'],
  });

export const createRoleBodySchema = z.object({
  name: localizedName,
  level: z.number().optional(),
});

export const updateRoleBodySchema = z.object({
  name: localizedName.optional(),
  code: z.string().min(1).optional(),
  level: z.number().optional(),
  status: statusFilterSchema.shape.status.optional(),
});

export const assignPermissionsParamsSchema = roleIdParamSchema;

export const assignPermissionsBodySchema = z.object({
  moduleId: z.string().min(1),
  permissions: z.array(z.string().min(1)).min(1),
});

export const listRolesQuerySchema = paginationQuerySchema
  .merge(statusFilterSchema)
  .extend({
    searchKey: z.string().optional(),
  });

export const roleIdParamsSchema = idParamSchema;

export const assignRoleParamsSchema = idParamSchema;

export const assignRoleBodySchema = z.object({
  roleId: z.string().min(1),
});

export type CreateRoleData = z.infer<typeof createRoleBodySchema>;
export type UpdateRoleData = z.infer<typeof updateRoleBodySchema>;
export type AssignPermissionsData = z.infer<
  typeof assignPermissionsParamsSchema
>;
export type AssignRoleData = z.infer<typeof assignRoleParamsSchema>;
