import { z } from 'zod';
import {
  idParamSchema,
  paginationQuerySchema,
  statusFilterSchema,
} from '../../common/common.validator.js';

const localizedText = z
  .record(
    z.string().regex(/^[a-z]{2}$/, 'Invalid language code'),
    z.string().trim().min(1, 'Translation cannot be empty'),
  )
  .refine((data) => !!data.en, {
    message: 'English (en) translation is required',
    path: ['en'],
  });

export const createSystemUserTypeBodySchema = z.object({
  name: localizedText,
  code: z.string().trim().min(1).optional(),
  description: localizedText.optional(),
  status: statusFilterSchema.shape.status.optional(),
});

export const updateSystemUserTypeBodySchema = z
  .object({
    name: localizedText.optional(),
    code: z.string().trim().min(1).optional(),
    description: localizedText.nullable().optional(),
    status: statusFilterSchema.shape.status.optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'At least one field is required',
  });

export const listSystemUserTypesQuerySchema = paginationQuerySchema
  .merge(statusFilterSchema)
  .extend({
    searchKey: z.string().trim().optional(),
  });

export const systemUserTypeIdParamsSchema = idParamSchema;
