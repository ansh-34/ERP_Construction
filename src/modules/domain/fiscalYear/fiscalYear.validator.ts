import { z } from 'zod';
import { paginationQuerySchema } from '../../common/common.validator.js';

const dateOnlySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must use YYYY-MM-DD format')
  .transform((value, context) => {
    const date = new Date(`${value}T00:00:00.000Z`);

    if (
      Number.isNaN(date.getTime()) ||
      date.toISOString().slice(0, 10) !== value
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid calendar date',
      });
      return z.NEVER;
    }

    return date;
  });

const fiscalYearDates = {
  startDate: dateOnlySchema,
  endDate: dateOnlySchema,
};

export const createFiscalYearBodySchema = z
  .object({
    name: z.string().trim().min(1).max(100),
    ...fiscalYearDates,
  })
  .refine((data) => data.startDate < data.endDate, {
    message: 'endDate must be after startDate',
    path: ['endDate'],
  });

export const updateFiscalYearBodySchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    startDate: dateOnlySchema.optional(),
    endDate: dateOnlySchema.optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'empty update payload',
  });

export const listFiscalYearsQuerySchema = paginationQuerySchema.extend({
  isClosed: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
  searchKey: z.string().trim().min(1).optional(),
});

export const fiscalYearIdParamSchema = z.object({
  id: z.string().uuid('Invalid fiscal year ID'),
});
