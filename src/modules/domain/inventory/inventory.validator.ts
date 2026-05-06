import { z } from 'zod';
import { paginationQuerySchema } from '../../common/common.validator.js';

export const addInventoryItemBodySchema = z.object({
  name: z.string().min(1),
  quantity: z.number(),
  reorderLevel: z.number().optional(),
  code: z.string().optional(),
});

export const inventoryListQuerySchema = paginationQuerySchema;

export type AddInventoryItemData = z.infer<typeof addInventoryItemBodySchema>;
