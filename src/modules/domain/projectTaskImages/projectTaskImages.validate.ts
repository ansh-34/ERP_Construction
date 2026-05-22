import { z } from 'zod';

const singleLineDescription = z
  .string()
  .trim()
  .refine((value) => !/[\r\n]/.test(value), {
    message: 'Description must be single-line',
  });

export const createProjectTaskImageBody = z.object({
  imageId: z.string().trim().uuid({ message: 'Valid image id is required' }),
  description: singleLineDescription.nullable().optional(),
  taskId: z.string().trim().uuid({ message: 'Valid task id is required' }),
});

export const listProjectTaskImageQuery = z.object({
  taskId: z
    .string()
    .trim()
    .uuid({ message: 'Valid task id is required' })
    .optional(),
  offset: z.string().trim().optional(),
  limit: z.string().trim().optional(),
});

export const idParams = z.object({
  id: z.string().trim().uuid({ message: 'Valid id is required' }),
});
