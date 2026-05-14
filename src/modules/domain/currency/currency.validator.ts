import { z } from 'zod';
import {
  idParamSchema,
  paginationQuerySchema,
} from '../../common/common.validator.js';

export const listCurrenciesQuerySchema = z.object({
  ...paginationQuerySchema.shape,
  searchKey: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  code: z.string().optional(),
  dir: z.enum(['ltr', 'rtl']).optional(),
});

export const currencyIdParamsSchema = idParamSchema;
