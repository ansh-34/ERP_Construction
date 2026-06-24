import { z } from 'zod';
import {
  idParamSchema,
  paginationQuerySchema,
} from '../../common/common.validator.js';

const alertStatus = z.enum(['ACTIVE', 'RESOLVED', 'DISMISSED']);

export const listAlertQuery = paginationQuerySchema.extend({
  moduleCode: z.string().trim().optional(),
  alertCode: z.string().trim().optional(),
  alertStatus: alertStatus.optional(),
  entityType: z.string().trim().optional(),
  entityId: z.string().trim().uuid().optional(),
  searchKey: z.string().trim().optional(),
});

export const alertIdParams = idParamSchema;

export const updateAlertStatusBody = z.object({
  alertStatus,
});
