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
const singleLineDescriptionSchema = z
  .string()
  .trim()
  .refine((value) => !/[\r\n]/.test(value), {
    message: 'Description must be single-line',
  });

const nonNegativeNumber = z
  .number()
  .finite()
  .nonnegative({ message: 'Value must be non-negative' });
const dateString = z.string().trim().min(1);
const lockedExpectedDate = z
  .never({ invalid_type_error: 'Expected dates cannot be updated' })
  .optional();
const createOnlyActualDate = z
  .never({ invalid_type_error: 'Actual dates can only be set during update' })
  .optional();

export const createProjectBodySchema = z.object({
  name: localizedStringSchema,
  description: singleLineDescriptionSchema.nullable().optional(),
  budget: nonNegativeNumber,
  spent: nonNegativeNumber.optional(),
  expectedStartDate: dateString.optional(),
  expectedEndDate: dateString.optional(),
  actualStartDate: createOnlyActualDate,
  actualEndDate: createOnlyActualDate,
  locationId: z.string().trim().min(1, { message: 'Location id is required' }),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  projectStages: z
    .array(
      z.object({
        name: localizedStringSchema,
        description: singleLineDescriptionSchema.nullable().optional(),
        progress: nonNegativeNumber.nullable().optional(),
        expectedStartDate: dateString.optional(),
        expectedEndDate: dateString.optional(),
        actualStartDate: createOnlyActualDate,
        actualEndDate: createOnlyActualDate,
        status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
      }),
    )
    .optional(),
});

export const updateProjectBodySchema = z.object({
  name: optionalLocalizedStringSchema,
  description: singleLineDescriptionSchema.nullable().optional(),
  budget: nonNegativeNumber.optional(),
  spent: nonNegativeNumber.optional(),
  expectedStartDate: lockedExpectedDate,
  expectedEndDate: lockedExpectedDate,
  actualStartDate: dateString.nullable().optional(),
  actualEndDate: dateString.nullable().optional(),
  locationId: z.string().trim().min(1).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export const listProjectsQuerySchema = paginationQuerySchema
  .merge(statusFilterSchema)
  .extend({
    searchKey: z.string().optional(),
  });

export const projectIdParamsSchema = idParamSchema;
