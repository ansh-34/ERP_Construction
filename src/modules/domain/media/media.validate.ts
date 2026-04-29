import { z } from 'zod';

export const createMediaBody = z.object({
  domainId: z.string().trim().min(1, { message: 'Domain id is required' }),
});

export const updateMediaBody = z
  .object({
    name: z.string().trim().min(1, { message: 'Name is required' }).optional(),
    type: z.string().trim().min(1, { message: 'Type is required' }).optional(),
  })
  .refine((data) => data.name !== undefined || data.type !== undefined, {
    message: 'At least one field is required',
  });

export const domainIdQuery = z.object({
  domainId: z.string().trim().min(1, { message: 'Domain id is required' }),
});

export const idParams = z.object({
  id: z.string().trim().min(1, { message: 'Id is required' }),
});
