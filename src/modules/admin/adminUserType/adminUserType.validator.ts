import { z } from 'zod';
import {
  idParamSchema,
  paginationQuerySchema,
  statusFilterSchema,
} from '../../common/common.validator.js';

export const selectAdminUserTypesBodySchema = z.object({
  systemUserTypeIds: z.array(z.string().uuid()).min(1),
});

export const listAdminUserTypesQuerySchema = paginationQuerySchema
  .merge(statusFilterSchema)
  .extend({
    searchKey: z.string().trim().optional(),
  });

export const adminUserTypeIdParamsSchema = idParamSchema;
