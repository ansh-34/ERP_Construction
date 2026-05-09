import { z } from 'zod';
import { idParamSchema } from '../../common/common.validator.js';

export const createModuleDependencyPermissionBodySchema = z.object({
  moduleDependencyId: z.string().min(1),
  permissionIds: z.array(z.string().min(1)).min(1),
});

export const moduleDependencyPermissionIdParamsSchema = idParamSchema;
