import { z } from 'zod';
import {
  idParamSchema,
  pageBasedPaginationQuerySchema,
  statusFilterSchema,
} from '../../common/common.validator.js';

const localizedValue = z
  .record(z.string(), z.string())
  .refine((val) => Object.keys(val).length > 0, {
    message: 'must have at least one language key',
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
  status: z.enum(['active', 'inactive']).optional(),
});

// ── Query schemas ─────────────────────────────────────────────
export const listProductGradeStdRateQuerySchema =
  pageBasedPaginationQuerySchema.merge(statusFilterSchema);

// ── Param schemas ─────────────────────────────────────────────
export const productGradeStdRateParentParamSchema = z.object({
  productId: z.string().uuid(),
  gradeId: z.string().uuid(),
});

export const productGradeStdRateIdParamSchema = idParamSchema.extend({
  productId: z.string().uuid(),
  gradeId: z.string().uuid(),
});

// ── DTO types ─────────────────────────────────────────────────
export type CreateProductGradeStdRateDto = z.infer<
  typeof createProductGradeStdRateBodySchema
>;
export type UpdateProductGradeStdRateDto = z.infer<
  typeof updateProductGradeStdRateBodySchema
>;
export type ListProductGradeStdRateQuery = z.infer<
  typeof listProductGradeStdRateQuerySchema
>;
