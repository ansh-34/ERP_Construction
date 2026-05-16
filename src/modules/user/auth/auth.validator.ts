import { z } from 'zod';
import { paginationQuerySchema } from '../../common/common.validator.js';

const industryValues = [
  'CONSTRUCTION',
  'MANUFACTURING',
  'MINING',
  'PROPERTY',
] as const;

const normalizeIndustry = (value: unknown) =>
  typeof value === 'string' ? value.trim().toUpperCase() : value;

/**
 * Minimum 8 chars, at least 1 uppercase, 1 lowercase, 1 digit, 1 special character.
 */
const strongPasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/,
    'Password must contain uppercase, lowercase, number, and special character',
  );

export const verifyAndActivateUserQuerySchema = z.object({
  email: z.string().email(),
  token: z.string().min(1),
});

export const registerUserBodySchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(1),
  phone: z.string().optional(),
  phoneCode: z.string().optional(),
});

export const loginUserBodySchema = z.object({
  identifier: z.string().min(1),
  password: z.string().min(1),
  speciality: z.preprocess(normalizeIndustry, z.enum(industryValues)),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const verifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z
    .string()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d{6}$/, 'OTP must be numeric'),
});

export const resetPasswordSchema = z.object({
  resetToken: z.string().min(1),
  newPassword: strongPasswordSchema,
});

export const listUsersQuerySchema = paginationQuerySchema;

export const refreshTokenSchema = z.object({
  accessToken: z.string().min(1).optional(),
  refreshToken: z.string().min(1).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: strongPasswordSchema,
});
