import { z } from 'zod';
import {
  idParamSchema,
  paginationQuerySchema,
  statusFilterSchema,
} from '../../common/common.validator.js';

export const createCurrencyBodySchema = z.object({
  name: z
    .record(
      z.string().regex(/^[a-z]{2}$/, 'Invalid language code'),
      z.string().min(1, 'Translation cannot be empty'),
    )
    .refine((data) => !!data.en, {
      message: 'English (en) translation is required',
      path: ['en'],
    }),
  symbol: z.string().min(1),
  flag: z.string(),
});

export const updateCurrencyBodySchema = z.object({
  name: z
    .record(
      z.string().regex(/^[a-z]{2}$/, 'Invalid language code'),
      z.string().min(1, 'Translation cannot be empty'),
    )
    .refine((data) => !!data.en, {
      message: 'English (en) translation is required',
      path: ['en'],
    })
    .optional(),
  status: statusFilterSchema.shape.status.optional(),
  symbol: z.string().min(1).optional(),
  flag: z.string().optional(),
});

export const listCurrenciesQuerySchema = z.object({
  ...paginationQuerySchema.shape,
  searchKey: z.string().optional(),
  status: statusFilterSchema.shape.status.optional(),
});

export const currencyIdParamsSchema = idParamSchema;

export type CreateCurrencyData = z.infer<typeof createCurrencyBodySchema>;
export type UpdateCurrencyData = z.infer<typeof updateCurrencyBodySchema>;
