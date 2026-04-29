import { z } from 'zod';
import {
  idParamSchema,
  paginationQuerySchema,
} from '../../common/common.validator.js';

export const createModuleDependencyBodySchema = z.object({
  moduleId: z.string().min(1),
  dependentModuleId: z.string().min(1),
});

export const listModuleDependenciesQuerySchema = paginationQuerySchema;

export const moduleDependencyIdParamsSchema = idParamSchema;

export type CreateModuleDependencyData = z.infer<
  typeof createModuleDependencyBodySchema
>;
