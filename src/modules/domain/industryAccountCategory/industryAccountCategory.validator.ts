import { z } from 'zod';
import {
  paginationQuerySchema,
  statusFilterSchema,
} from '../../common/common.validator.js';

const industryType = z.preprocess(
  (value) => (typeof value === 'string' ? value.trim().toUpperCase() : value),
  z.enum(['CONSTRUCTION', 'MANUFACTURING', 'MINING', 'PROPERTY']),
);

export const listIndustryAccountCategoriesQuerySchema =
  paginationQuerySchema.extend({
    industryType: industryType.optional(),
    status: statusFilterSchema.shape.status.optional(),
    searchKey: z.string().trim().min(1).optional(),
  });
