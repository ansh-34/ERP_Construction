import { z } from 'zod';

const singleLineDescription = z
  .string()
  .trim()
  .refine((value) => !/[\r\n]/.test(value), {
    message: 'Description must be single-line',
  });

const taskSubmissionImageSchema = z.object({
  imageUrl: z.string().trim().min(1, { message: 'Image url is required' }),
  description: singleLineDescription.nullable().optional(),
});

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
  images: z.array(taskSubmissionImageSchema).optional(),
});

export const idParams = z.object({
  id: z.string().trim().min(1, { message: 'Task id is required' }),
});
