import { z } from 'zod';
import {
  idParamSchema,
  paginationQuerySchema,
  roleIdParamSchema,
} from '../../common/common.validator.js';

export const createRoleBodySchema = z.object({
  name: z.any(),
  code: z.string().min(1),
  level: z.number().optional(),
});

export const assignPermissionsParamsSchema = roleIdParamSchema;

export const assignPermissionsBodySchema = z.object({
  moduleId: z.string().min(1),
  permissions: z.array(z.string().min(1)).min(1),
});

export const listRolesQuerySchema = paginationQuerySchema;

export const assignRoleParamsSchema = idParamSchema;

export const assignRoleBodySchema = z.object({
  roleId: z.string().min(1),
});

export type CreateRoleData = z.infer<typeof createRoleBodySchema>;
export type AssignPermissionsData = z.infer<
  typeof assignPermissionsParamsSchema
>;
export type AssignRoleData = z.infer<typeof assignRoleParamsSchema>;
