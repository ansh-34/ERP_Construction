import { StatusEnum } from '@constants/index';
import { z } from 'zod';

const nonNegativeNumber = z
  .number()
  .finite()
  .nonnegative({ message: 'Value must be non-negative' });

export const createMachineryBody = z.object({
  code: z.string().trim().min(1, { message: 'Code is required' }),
  type: z.string().trim().min(1, { message: 'Type is required' }),
  expectedLitrePerHour: nonNegativeNumber,
  projectId: z.string().trim().min(1, { message: 'Project id is required' }),
  domainId: z.string().trim().min(1, { message: 'Domain id is required' }),
  status: z.nativeEnum(StatusEnum).optional(),
});

export const updateMachineryBody = z
  .object({
    code: z.string().trim().min(1).optional(),
    type: z.string().trim().min(1).optional(),
    expectedLitrePerHour: nonNegativeNumber.optional(),
    status: z.nativeEnum(StatusEnum).optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'At least one field is required',
  });

export const listMachineryQuery = z.object({
  domainId: z.string().trim().min(1, { message: 'Domain id is required' }),
  projectId: z.string().trim().min(1).optional(),
});

export const domainIdQuery = z.object({
  domainId: z.string().trim().min(1, { message: 'Domain id is required' }),
});

export const idParams = z.object({
  id: z.string().trim().min(1, { message: 'Id is required' }),
});
