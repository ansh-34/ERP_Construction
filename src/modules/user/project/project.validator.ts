import { z } from 'zod';
import {
  idParamSchema,
  paginationQuerySchema,
  statusFilterSchema,
} from '../../common/common.validator.js';

const localizedStringSchema = z
  .record(
    z.string().regex(/^[a-z]{2}$/, 'Invalid language code'),
    z.string().min(1, 'Translation cannot be empty'),
  )
  .refine((data) => !!data.en, {
    message: 'English (en) translation is required',
    path: ['en'],
  });

const optionalLocalizedStringSchema = z
  .record(
    z.string().regex(/^[a-z]{2}$/, 'Invalid language code'),
    z.string().min(1, 'Translation cannot be empty'),
  )
  .optional();

const nonNegativeNumber = z
  .number()
  .finite()
  .nonnegative({ message: 'Value must be non-negative' });

export const createProjectBodySchema = z.object({
  name: localizedStringSchema,
  description: optionalLocalizedStringSchema,
  budget: nonNegativeNumber,
  spent: nonNegativeNumber.optional(),
  locationId: z.string().trim().min(1, { message: 'Location id is required' }),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export const updateProjectBodySchema = z.object({
  name: optionalLocalizedStringSchema,
  description: optionalLocalizedStringSchema,
  budget: nonNegativeNumber.optional(),
  spent: nonNegativeNumber.optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export const listProjectsQuerySchema = paginationQuerySchema
  .merge(statusFilterSchema)
  .extend({
    searchKey: z.string().optional(),
  });

export const projectIdParamsSchema = idParamSchema;
