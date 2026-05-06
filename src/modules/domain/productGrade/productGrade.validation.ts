import { z } from 'zod';
import {
  idParamSchema,
  pageBasedPaginationQuerySchema,
  statusFilterSchema,
} from '../../common/common.validator.js';

const localizedName = z
  .record(z.string(), z.string())
  .refine((val) => Object.keys(val).length > 0, {
    message: 'must have at least one language key',
  });

// ── Body schemas ──────────────────────────────────────────────
export const createProductGradeBodySchema = z.object({
  gradeDisplayName: localizedName,
  gradeCode: z.string().min(1, 'gradeCode is required'),
  status: z.enum(['active', 'inactive']).default('active'),
});

export const updateProductGradeBodySchema = z.object({
  gradeDisplayName: localizedName.optional(),
  gradeCode: z.string().min(1).optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

// ── Query schemas ─────────────────────────────────────────────
export const listProductGradeQuerySchema =
  pageBasedPaginationQuerySchema.merge(statusFilterSchema);

// ── Param schemas ─────────────────────────────────────────────
export const productGradeProductIdParamSchema = z.object({
  productId: z.string().uuid(),
});

export const productGradeIdParamSchema = idParamSchema.extend({
  productId: z.string().uuid(),
});

// ── DTO types ─────────────────────────────────────────────────
export type CreateProductGradeDto = z.infer<
  typeof createProductGradeBodySchema
>;
export type UpdateProductGradeDto = z.infer<
  typeof updateProductGradeBodySchema
>;
export type ListProductGradeQuery = z.infer<typeof listProductGradeQuerySchema>;
