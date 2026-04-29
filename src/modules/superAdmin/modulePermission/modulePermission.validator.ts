import { z } from 'zod';
import {
  idParamSchema,
  paginationQuerySchema,
} from '../../common/common.validator.js';

export const setModulePermissionsBodySchema = z.object({
  moduleId: z.string().min(1),
  permissions: z.array(z.string().min(1)).min(1),
});

export const listModulePermissionsQuerySchema = paginationQuerySchema;

export const modulePermissionIdParamsSchema = idParamSchema;

export type SetModulePermissionsData = z.infer<
  typeof setModulePermissionsBodySchema
>;
