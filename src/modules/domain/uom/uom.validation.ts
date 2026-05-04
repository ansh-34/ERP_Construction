import { z } from 'zod';
import {
  idParamSchema,
  pageBasedPaginationQuerySchema,
  statusFilterSchema,
} from '../../common/common.validator.js';

const localizedName = z.record(z.string(), z.string()).refine(
  (val) => Object.keys(val).length > 0,
  { message: 'must have at least one language key' }
);

// ── Body schemas ──────────────────────────────────────────────
export const createUomBodySchema = z.object({
  displayName: localizedName,
  code: z.string().min(1, 'code is required'),
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

// ── Query schemas ─────────────────────────────────────────────
export const listUomsQuerySchema = pageBasedPaginationQuerySchema.merge(statusFilterSchema);

// ── Param schemas ─────────────────────────────────────────────
export const uomIdParamSchema = idParamSchema;

// ── DTO types ─────────────────────────────────────────────────
export type CreateUomDto = z.infer<typeof createUomBodySchema>;
export type UpdateUomDto = z.infer<typeof updateUomBodySchema>;
export type ListUomsQuery = z.infer<typeof listUomsQuerySchema>;
