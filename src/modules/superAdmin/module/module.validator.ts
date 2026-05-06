import { z } from 'zod';
import {
  idParamSchema,
  paginationQuerySchema,
} from '../../common/common.validator.js';

export const createModuleBodySchema = z.object({
  name: z.any(),
  code: z.string().min(1),
});

export const moduleIdParamsSchema = idParamSchema;

export const listModulesQuerySchema = paginationQuerySchema;

export const updateModuleBodySchema = z.object({
  name: z.any().optional(),
  code: z.string().min(1).optional(),
  status: z.string().optional(),
});
