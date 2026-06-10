import { z } from 'zod';
import { paginationQuerySchema } from '../../common/common.validator.js';

export const listUsersQuerySchema = paginationQuerySchema.extend({
  roleCode: z.string().trim().optional(),
});
