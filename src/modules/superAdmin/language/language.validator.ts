import { z } from 'zod';
import {
  idParamSchema,
  paginationQuerySchema,
  statusFilterSchema,
} from '../../common/common.validator.js';

export const createLanguageBodySchema = z.object({
  name: z.string().min(2).max(100),
  code: z.string().regex(/^[a-z]{2}$/, 'Invalid language code'),
  dir: z.enum(['ltr', 'rtl']),
  flag: z.string(),
});

export const updateLanguageBodySchema = z.object({
  name: z.string().min(2).max(100).optional(),
  code: z
    .string()
    .regex(/^[a-z]{2}$/, 'Invalid language code')
    .optional(),
  status: statusFilterSchema.shape.status.optional(),
  dir: z.enum(['ltr', 'rtl']).optional(),
  flag: z.string().optional(),
});

export const listLanguagesQuerySchema = z.object({
  ...paginationQuerySchema.shape,
  searchKey: z.string().optional(),
  status: statusFilterSchema.shape.status.optional(),
  code: z.string().optional(),
  dir: z.enum(['ltr', 'rtl']).optional(),
});

export const languageIdParamsSchema = idParamSchema;

export type CreateLanguageData = z.infer<typeof createLanguageBodySchema>;
export type UpdateLanguageData = z.infer<typeof updateLanguageBodySchema>;
