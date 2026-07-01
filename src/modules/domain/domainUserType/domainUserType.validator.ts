import { z } from 'zod';
import {
  idParamSchema,
  paginationQuerySchema,
} from '../../common/common.validator.js';

export const createDomainUserTypeBodySchema = z.object({
  userTypeIds: z
    .array(z.string().uuid())
    .min(1, 'At least one userTypeId is required'),
});

export const listDomainUserTypesQuerySchema = paginationQuerySchema.extend({
  limit: z.coerce.number().int().min(1).max(500).optional(),
  searchKey: z.string().optional(),
});

export const domainUserTypeIdParamsSchema = idParamSchema;
