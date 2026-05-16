import { z } from 'zod';

const jsonObject = z.record(z.string(), z.unknown());

export const createApiKeyBody = z.object({
  name: jsonObject,
  description: jsonObject,
  domainId: z.string().trim().min(1, { message: 'Domain id is required' }),
});

export const updateApiKeyBody = z
  .object({
    name: jsonObject.optional(),
    description: jsonObject.optional(),
  })
  .refine((data) => data.name !== undefined || data.description !== undefined, {
    message: 'At least one field is required',
  });

export const domainIdQuery = z.object({
  domainId: z.string().trim().min(1, { message: 'Domain id is required' }),
  searchKey: z.string().trim().optional(),
});

export const idParams = z.object({
  id: z.string().trim().min(1, { message: 'Id is required' }),
});
