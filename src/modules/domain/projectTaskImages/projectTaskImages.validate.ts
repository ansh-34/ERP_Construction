import { StatusEnum } from '@constants/index';
import { z } from 'zod';

const jsonObject = z.record(z.string(), z.unknown());

export const createProjectTaskImageBody = z.object({
  imageUrl: z.string().trim().min(1, { message: 'Image url is required' }),
  imageName: jsonObject.nullable().optional(),
  imageType: z.string().trim().min(1).nullable().optional(),
  description: jsonObject.nullable().optional(),
  taskId: z.string().trim().uuid({ message: 'Valid task id is required' }),
  status: z.nativeEnum(StatusEnum).optional(),
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
