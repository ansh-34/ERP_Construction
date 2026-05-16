import { z } from 'zod';

const jsonObject = z.record(z.string(), z.unknown());

export const createMediaBody = z.object({
  domainId: z.string().trim().min(1, { message: 'Domain id is required' }),
  name: jsonObject.optional(),
});

export const updateMediaBody = z
  .object({
    name: jsonObject.optional(),
    type: z.string().trim().min(1, { message: 'Type is required' }).optional(),
  })
  .refine((data) => data.name !== undefined || data.type !== undefined, {
    message: 'At least one field is required',
  });

export const domainIdQuery = z.object({
  domainId: z.string().trim().min(1, { message: 'Domain id is required' }),
  searchKey: z.string().trim().optional(),
});

export const idParams = z.object({
  id: z.string().trim().min(1, { message: 'Id is required' }),
});
