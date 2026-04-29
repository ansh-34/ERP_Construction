import { z } from 'zod';

export const createApiKeyBody = z.object({
  name: z.string().trim().min(1, { message: 'Name is required' }),
  description: z.string().trim().min(1, { message: 'Description is required' }),
  domainId: z.string().trim().min(1, { message: 'Domain id is required' }),
});

export const updateApiKeyBody = z
  .object({
    name: z.string().trim().min(1, { message: 'Name is required' }).optional(),
    description: z
      .string()
      .trim()
      .min(1, { message: 'Description is required' })
      .optional(),
  })
  .refine((data) => data.name !== undefined || data.description !== undefined, {
    message: 'At least one field is required',
  });

export const domainIdQuery = z.object({
  domainId: z.string().trim().min(1, { message: 'Domain id is required' }),
});

export const idParams = z.object({
  id: z.string().trim().min(1, { message: 'Id is required' }),
});
