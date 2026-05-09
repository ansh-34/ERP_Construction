import { z } from 'zod';
import {
  idParamSchema,
  pageBasedPaginationQuerySchema,
  statusFilterSchema,
} from '../../common/common.validator.js';

const localizedName = z
  .record(
    z.string().regex(/^[a-z]{2}$/, 'Invalid language code'),
    z.string().min(1, 'Translation cannot be empty'),
  )
  .refine((data) => !!data.en, {
    message: 'English (en) translation is required',
    path: ['en'],
  });

// Body schemas
export const createUomBodySchema = z.object({
  displayName: localizedName,
  baseUomId: z.string().uuid(),
  conversionRate: z.number().min(0, 'conversionRate must be >= 0'),
  status: z.enum(['active', 'inactive']).default('active'),
});

export const updateUomBodySchema = z.object({
  displayName: localizedName.optional(),
  code: z.string().min(1).optional(),
  baseUomId: z.string().uuid().optional(),
  conversionRate: z.number().min(0).optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

// Query schemas
export const listUomsQuerySchema =
  pageBasedPaginationQuerySchema.merge(statusFilterSchema);

// Param schemas =
export const uomIdParamSchema = idParamSchema;
