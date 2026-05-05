import { z } from 'zod';
import {
  idParamSchema,
  pageBasedPaginationQuerySchema,
  statusFilterSchema,
} from '../../common/common.validator.js';

// ── Body schemas ──────────────────────────────────────────────
export const createProductUomBodySchema = z.object({
  uomId: z.string().uuid('uomId must be a valid UUID'),
  status: z.enum(['active', 'inactive']).default('active'),
});

// ── Query schemas ─────────────────────────────────────────────
export const listProductUomQuerySchema =
  pageBasedPaginationQuerySchema.merge(statusFilterSchema);

// ── Param schemas ─────────────────────────────────────────────
export const productUomProductIdParamSchema = z.object({
  productId: z.string().uuid(),
});

export const productUomIdParamSchema = idParamSchema.extend({
  productId: z.string().uuid(),
});

// ── DTO types ─────────────────────────────────────────────────
export type CreateProductUomDto = z.infer<typeof createProductUomBodySchema>;
export type ListProductUomQuery = z.infer<typeof listProductUomQuerySchema>;
