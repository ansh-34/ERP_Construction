import { z } from 'zod';
import {
  idParamSchema,
  paginationQuerySchema,
  statusFilterSchema,
} from '../../common/common.validator.js';

export const listProductGradeLastPurchaseRateQuerySchema = paginationQuerySchema
  .merge(statusFilterSchema)
  .extend({
    searchKey: z.string().optional(),
    productId: z.string().uuid().optional().or(z.literal('')),
    gradeId: z.string().uuid().optional().or(z.literal('')),
    productGradeId: z.string().uuid().optional().or(z.literal('')),
    uomId: z.string().uuid().optional().or(z.literal('')),
    lang: z.string().optional(),
  });

export const productGradeLastPurchaseRateIdParamSchema = idParamSchema;
