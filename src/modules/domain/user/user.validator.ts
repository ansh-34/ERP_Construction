import { z } from 'zod';
import { paginationQuerySchema } from '../../common/common.validator.js';

export const inviteUserBodySchema = z.object({
  name: z.string().optional(),
  email: z.string().email(),
  roleId: z.string().optional(),
  skills: z.array(z.string().trim().min(1)).optional(),
  minDayCharge: z.number().finite().nonnegative().optional(),
});

export const listUsersQuerySchema = paginationQuerySchema.extend({
  roleCode: z.string().trim().optional(),
});
