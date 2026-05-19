import {
  idParamSchema,
  statusFilterSchema,
} from '@/modules/common/common.validator';
import { z } from 'zod';

export const createAdminSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string(),
  phoneCode: z.string(),
  mediaId: z.string().optional(),
});

export const listAdminsQuerySchema = z.object({
  offset: z.coerce.number().int().min(0).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  searchKey: z.string().optional(),
  status: statusFilterSchema.shape.status.optional(),
});

export const adminIdSchema = idParamSchema;

export const updateAdminSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  phoneCode: z.string().optional(),
  mediaId: z.string().optional(),
  status: statusFilterSchema.shape.status.optional(),
  offeredLanguages: z.array(z.string()).optional(),
  offeredCurrencies: z.array(z.string()).optional(),
});
