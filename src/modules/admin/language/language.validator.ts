import { z } from 'zod';
import {
  idParamSchema,
  paginationQuerySchema,
  statusFilterSchema,
} from '../../common/common.validator.js';

export const listLanguagesQuerySchema = z.object({
  ...paginationQuerySchema.shape,
  searchKey: z.string().optional(),
  status: statusFilterSchema.shape.status.optional(),
  isDefault: z.boolean().optional(),
  isEnabled: z.boolean().optional(),
});

export const languageIdParamsSchema = idParamSchema;

export const updateLanguageBodySchema = z.object({
  status: statusFilterSchema.shape.status.optional(),
  isDefault: z.boolean().optional(),
  isEnabled: z.boolean().optional(),
});
