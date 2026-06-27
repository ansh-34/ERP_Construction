import { z } from 'zod';
import {
  idParamSchema,
  paginationQuerySchema,
  statusFilterSchema,
} from '../../common/common.validator.js';

const nonNegativeNumber = z.coerce.number().min(0);
const optionalText = z.string().trim().min(1).optional();
const optionalDateQuery = z.preprocess(
  (value) => (value === '' ? undefined : value),
  z.coerce.date().optional(),
);
const optionalUuidQuery = z.preprocess(
  (value) => (value === '' ? undefined : value),
  z.string().uuid().optional(),
);

export const createCustomerPaymentBodySchema = z.object({
  customerId: z.string().uuid('Invalid customer ID'),
  paidDate: z.coerce.date(),
  amount: nonNegativeNumber,
  roundOffAmount: z.coerce.number().default(0),
  paymentType: z.enum(['CASH']).default('CASH'),
  cashLedgerId: z.string().uuid('Invalid cash ledger ID').optional(),
  remarks: optionalText,
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

export const updateCustomerPaymentBodySchema = z
  .object({
    customerId: z.string().uuid('Invalid customer ID').optional(),
    paidDate: z.coerce.date().optional(),
    amount: nonNegativeNumber.optional(),
    roundOffAmount: z.coerce.number().optional(),
    paymentType: z.enum(['CASH']).optional(),
    cashLedgerId: z
      .string()
      .uuid('Invalid cash ledger ID')
      .nullable()
      .optional(),
    remarks: z.string().trim().min(1).nullable().optional(),
    status: statusFilterSchema.shape.status.optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'empty update payload',
  });

export const listCustomerPaymentsQuerySchema = paginationQuerySchema
  .merge(statusFilterSchema)
  .extend({
    customerId: optionalUuidQuery,
    paymentType: z.enum(['CASH']).optional(),
    searchKey: z.string().trim().optional(),
    fromDate: optionalDateQuery,
    toDate: optionalDateQuery,
  });

export const customerPaymentIdParamSchema = idParamSchema;
