import { StatusEnum } from '@constants/index';
import { z } from 'zod';

const jsonObject = z.record(z.string(), z.unknown());

export const createProjectTaskImageBody = z.object({
  imageUrl: z.string().trim().min(1, { message: 'Image url is required' }),
  imageName: jsonObject.nullable().optional(),
  imageType: z.string().trim().min(1).nullable().optional(),
  description: jsonObject.nullable().optional(),
  taskId: z.string().trim().min(1, { message: 'Task id is required' }),
  domainId: z.string().trim().min(1, { message: 'Domain id is required' }),
  adminId: z.string().trim().min(1, { message: 'Admin id is required' }),
  status: z.nativeEnum(StatusEnum).optional(),
});

export const listProjectTaskImageQuery = z.object({
  domainId: z.string().trim().min(1, { message: 'Domain id is required' }),
  adminId: z.string().trim().min(1, { message: 'Admin id is required' }),
  taskId: z.string().trim().min(1).optional(),
  offset: z.string().trim().optional(),
  limit: z.string().trim().optional(),
});

export const domainIdQuery = z.object({
  domainId: z.string().trim().min(1, { message: 'Domain id is required' }),
  adminId: z.string().trim().min(1, { message: 'Admin id is required' }),
});

export const idParams = z.object({
  id: z.string().trim().min(1, { message: 'Id is required' }),
});
