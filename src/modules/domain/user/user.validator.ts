import { z } from 'zod';
import { paginationQuerySchema } from '../../common/common.validator.js';

export const verifyAndActivateUserBodySchema = z.object({
  email: z.string().email(),
  token: z.string().min(1),
  password: z.string().min(1),
});

export const registerUserBodySchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(1),
  phone: z.string().optional(),
  phoneCode: z.string().optional(),
});

export const loginUserBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const inviteUserBodySchema = z.object({
  name: z.string().optional(),
  email: z.string().email(),
  roleId: z.string().optional(),
});

export const listUsersQuerySchema = paginationQuerySchema;
