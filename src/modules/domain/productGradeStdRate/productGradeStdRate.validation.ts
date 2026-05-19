import { z } from 'zod';
import {
  idParamSchema,
  pageBasedPaginationQuerySchema,
  statusFilterSchema,
} from '../../common/common.validator.js';

const localizedValue = z
  .record(
    z.string().regex(/^[a-z]{2}$/, 'Invalid language code'),
    z.string().min(1, 'Translation cannot be empty'),
  )
  .refine((data) => !!data.en, {
    message: 'English (en) translation is required',
    path: ['en'],
  });

// ── Body schemas ──────────────────────────────────────────────
export const createProductGradeStdRateBodySchema = z.object({
  stdRateType: localizedValue,
  stdRateValue: z.number().min(0, 'stdRateValue must be >= 0'),
  alertThresold: z.number().min(0, 'alertThresold must be >= 0'),
  status: z.enum(['active', 'inactive']).default('active'),
});

export const updateProductGradeStdRateBodySchema = z.object({
  stdRateType: localizedValue.optional(),
  stdRateValue: z.number().min(0).optional(),
  alertThresold: z.number().min(0).optional(),
  status: statusFilterSchema.shape.status.optional(),
});

// ── Query schemas ─────────────────────────────────────────────
export const listProductGradeStdRateQuerySchema = pageBasedPaginationQuerySchema
  .merge(statusFilterSchema)
  .extend({
    searchKey: z.string().optional(),
  });

// ── Param schemas ─────────────────────────────────────────────
export const productGradeStdRateParentParamSchema = z.object({
  productId: z.string().uuid(),
  gradeId: z.string().uuid(),
});

export const productGradeStdRateIdParamSchema = idParamSchema.extend({
  productId: z.string().uuid(),
  gradeId: z.string().uuid(),
});
