import { z } from 'zod';

export const submitTaskBody = z.object({
  actualEndDate: z
    .string()
    .trim()
    .min(1, { message: 'Submission date is required' }),
  taskProgress: z
    .number()
    .finite()
    .nonnegative()
    .max(100, { message: 'Progress cannot be greater than 100' })
    .optional(),
  notes: z.string().trim().optional(),
});

export const idParams = z.object({
  id: z.string().trim().min(1, { message: 'Task id is required' }),
});
