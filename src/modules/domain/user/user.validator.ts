import { z } from 'zod';
import { paginationQuerySchema } from '../../common/common.validator.js';

export const inviteUserBodySchema = z.object({
  name: z.string().optional(),
  email: z.string().email(),
  roleId: z.string().optional(),
});

export const listUsersQuerySchema = paginationQuerySchema;
