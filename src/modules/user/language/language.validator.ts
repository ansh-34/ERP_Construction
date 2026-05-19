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
  code: z.string().optional(),
  dir: z.enum(['ltr', 'rtl']).optional(),
});

export const languageIdParamsSchema = idParamSchema;
