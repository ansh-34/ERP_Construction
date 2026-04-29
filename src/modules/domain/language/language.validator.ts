import { z } from 'zod';
import { paginationQuerySchema } from '../../common/common.validator.js';

export const createLanguageBodySchema = z.object({
  name: z.any(),
  code: z.string().min(1),
});

export const listLanguagesQuerySchema = paginationQuerySchema;

export type CreateLanguageData = z.infer<typeof createLanguageBodySchema>;
