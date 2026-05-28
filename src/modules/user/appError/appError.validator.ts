import { z } from 'zod';
import { paginationDateQuerySchema } from '../../common/common.validator.js';

export const createAppErrorBodySchema = z.object({
  deviceName: z.string().min(1),
  version: z.string().min(1),
  error: z.string().min(1),
  functionName: z.string().min(1),
});

export const listAppErrorsQuerySchema = paginationDateQuerySchema;

export type CreateAppErrorData = z.infer<typeof createAppErrorBodySchema>;
