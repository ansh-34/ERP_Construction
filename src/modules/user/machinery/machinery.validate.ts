import { StatusEnum } from '@constants/index';
import { z } from 'zod';

const singleLineType = z
  .string()
  .trim()
  .min(1, { message: 'Type is required' })
  .refine((value) => !/[\r\n]/.test(value), {
    message: 'Type must be single-line',
  });
const nonNegativeNumber = z
  .number()
  .finite()
  .nonnegative({ message: 'Value must be non-negative' });

export const createMachineryBody = z.object({
  code: z.string().trim().min(1, { message: 'Code is required' }),
  type: singleLineType,
  expectedLitrePerHour: nonNegativeNumber.optional(),
  projectId: z.string().trim().min(1, { message: 'Project id is required' }),
  status: z.nativeEnum(StatusEnum).optional(),
});

export const updateMachineryBody = z
  .object({
    code: z.string().trim().min(1).optional(),
    type: singleLineType.optional(),
    expectedLitrePerHour: nonNegativeNumber.optional(),
    status: z.nativeEnum(StatusEnum).optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'At least one field is required',
  });

export const listMachineryQuery = z.object({
  projectId: z.string().trim().min(1).optional(),
  searchKey: z.string().trim().optional(),
  offset: z.string().trim().optional(),
  limit: z.string().trim().optional(),
});

export const idParams = z.object({
  id: z.string().trim().min(1, { message: 'Id is required' }),
});
