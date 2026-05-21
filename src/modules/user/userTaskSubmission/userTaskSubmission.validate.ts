import { z } from 'zod';
import { StatusEnum } from '@constants/index';

const optionalLocalizedObject = z.record(z.unknown()).nullable().optional();

const taskSubmissionImageSchema = z.object({
  imageUrl: z.string().trim().min(1, { message: 'Image url is required' }),
  imageName: optionalLocalizedObject,
  imageType: z.string().trim().min(1).nullable().optional(),
  description: optionalLocalizedObject,
  status: z.nativeEnum(StatusEnum).optional(),
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
