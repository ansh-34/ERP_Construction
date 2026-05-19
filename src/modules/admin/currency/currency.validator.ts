import { z } from 'zod';
import {
  idParamSchema,
  paginationQuerySchema,
  statusFilterSchema,
} from '../../common/common.validator.js';

export const listCurrenciesQuerySchema = z.object({
  ...paginationQuerySchema.shape,
  searchKey: z.string().optional(),
  status: statusFilterSchema.shape.status.optional(),
  isEnabled: z.boolean().optional(),
  isDefault: z.boolean().optional(),
});

export const currencyIdParamsSchema = idParamSchema;

export const updateCurrencyBodySchema = z.object({
  status: statusFilterSchema.shape.status.optional(),
  isDefault: z.boolean().optional(),
  isEnabled: z.boolean().optional(),
});
