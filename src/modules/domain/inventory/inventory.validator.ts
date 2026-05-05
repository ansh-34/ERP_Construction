import { z } from 'zod';
import {
  idParamSchema,
  paginationQuerySchema,
  statusFilterSchema,
} from '../../common/common.validator.js';

export const createInventoryBodySchema = z.object({
  productId: z.string().uuid(),
  productGradeId: z.string().uuid(),
  quantity: z.number().min(0),
  uomId: z.string().uuid(),
  reorderLevel: z.number().min(0).optional().default(0),
});

export const updateReorderLevelBodySchema = z.object({
  reorderLevel: z.number().min(0),
});

export const inventoryListQuerySchema =
  paginationQuerySchema.merge(statusFilterSchema);

export const inventoryIdParamsSchema = idParamSchema;

export type CreateInventoryDto = z.infer<typeof createInventoryBodySchema>;
export type UpdateReorderLevelDto = z.infer<
  typeof updateReorderLevelBodySchema
>;
export type InventoryListQuery = z.infer<typeof inventoryListQuerySchema>;
