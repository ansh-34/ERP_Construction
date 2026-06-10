import { z } from 'zod';

const singleLineName = z
  .string()
  .trim()
  .min(1, { message: 'Name is required' })
  .refine((value) => !/[\r\n]/.test(value), {
    message: 'Name must be single-line',
  });

export const createMediaBody = z.object({
  names: z.union([z.string(), z.array(z.string())]).optional(),
  name: singleLineName.optional(),
});

export const updateMediaBody = z
  .object({
    name: singleLineName.optional(),
    type: z.string().trim().min(1, { message: 'Type is required' }).optional(),
  })
  .refine((data) => data.name !== undefined || data.type !== undefined, {
    message: 'At least one field is required',
  });

export const listMediaQuery = z.object({
  searchKey: z.string().trim().optional(),
  type: z.string().trim().optional(),
});

export const idParams = z.object({
  id: z.string().trim().min(1, { message: 'Id is required' }),
});
