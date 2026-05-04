import { z } from 'zod';

export const idParamSchema = z.object({
  id: z.string().min(1, { message: 'id is required' }),
});

export const roleIdParamSchema = z.object({
  roleId: z.string().min(1, { message: 'roleId is required' }),
});

export const paginationQuerySchema = z.object({
  offset: z.coerce.number().int().min(0).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const paginationDateQuerySchema = paginationQuerySchema.extend({
  from: z.string().optional(),
  to: z.string().optional(),
});

export const pageBasedPaginationQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).optional().default('1'),
  limit: z.string().regex(/^\d+$/).optional().default('10'),
});

export const statusFilterSchema = z.object({
  status: z.enum(['active', 'inactive']).optional(),
});
