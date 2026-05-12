import { z } from 'zod';
import {
  idParamSchema,
  paginationQuerySchema,
} from '../../common/common.validator.js';

export const listLanguagesQuerySchema = z.object({
  ...paginationQuerySchema.shape,
  searchKey: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  isDefault: z.boolean().optional(),
  isEnabled: z.boolean().optional(),
});

export const languageIdParamsSchema = idParamSchema;

export const updateLanguageBodySchema = z.object({
  status: z.enum(['active', 'inactive']).optional(),
  isDefault: z.boolean().optional(),
  isEnabled: z.boolean().optional(),
});
