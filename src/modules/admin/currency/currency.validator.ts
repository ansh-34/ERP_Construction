import { z } from 'zod';
import {
  idParamSchema,
  paginationQuerySchema,
} from '../../common/common.validator.js';

export const listCurrenciesQuerySchema = z.object({
  ...paginationQuerySchema.shape,
  searchKey: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  isEnabled: z.boolean().optional(),
  isDefault: z.boolean().optional(),
});

export const currencyIdParamsSchema = idParamSchema;

export const updateCurrencyBodySchema = z.object({
  status: z.enum(['active', 'inactive']).optional(),
  isDefault: z.boolean().optional(),
  isEnabled: z.boolean().optional(),
});
