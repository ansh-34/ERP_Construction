import { z } from 'zod';
import { paginationQuerySchema } from '../../common/common.validator.js';

export const listAdminUserTypeQuery = paginationQuerySchema.extend({
  searchKey: z.string().trim().optional(),
});
