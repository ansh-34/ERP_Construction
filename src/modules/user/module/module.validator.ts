import { z } from 'zod';
import {
  idParamSchema,
  paginationQuerySchema,
} from '../../common/common.validator.js';

const dependencyModuleSchema = z.object({
  moduleId: z.string().min(1),
  permissionIds: z.array(z.string().min(1)),
});

export const createModuleBodySchema = z.object({
  name: z
    .record(
      z.string().regex(/^[a-z]{2}$/, 'Invalid language code'),
      z.string().min(1, 'Translation cannot be empty'),
    )
    .refine((data) => !!data.en, {
      message: 'English (en) translation is required',
      path: ['en'],
    }),
  dependencyModules: z.array(dependencyModuleSchema).optional(),
  modulePermissionIds: z.array(z.string().min(1)).optional(),
});

export const moduleIdParamsSchema = idParamSchema;

export const listModulesQuerySchema = z.object({
  ...paginationQuerySchema.shape,
  searchKey: z.string().optional(),
});

export const updateModuleBodySchema = z.object({
  name: z.any().optional(),
  code: z.string().min(1).optional(),
  status: z.string().optional(),
});
