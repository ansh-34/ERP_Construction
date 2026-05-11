import { z } from 'zod';
import {
  idParamSchema,
  paginationQuerySchema,
} from '../../common/common.validator.js';

export const assignProjectUserRoleBodySchema = z.object({
  projectId: z.string().uuid(),
  userId: z.string().uuid(),
  roleId: z.string().uuid(),
});

export const updateProjectUserRoleBodySchema = z.object({
  roleId: z.string().uuid().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export const listProjectUserRolesQuerySchema = paginationQuerySchema.extend({
  projectId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  roleId: z.string().uuid().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export const projectUserRoleIdParamsSchema = idParamSchema;

export const projectIdParamsSchema = z.object({
  projectId: z.string().uuid(),
});

export const userIdParamsSchema = z.object({
  userId: z.string().uuid(),
});
