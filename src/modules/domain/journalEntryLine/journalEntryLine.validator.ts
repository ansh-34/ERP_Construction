import { z } from 'zod';
import { paginationQuerySchema } from '../../common/common.validator.js';

const optionalText = z.string().trim().min(1).max(500).nullable().optional();
const nullableUuid = z.string().uuid().nullable().optional();

export const createJournalEntryLineBodySchema = z.object({
  journalEntryId: z.string().uuid(),
  lineNo: z.coerce.number().int().positive(),
  accountId: z.string().uuid(),
  debitAmount: z.coerce.number().min(0).default(0),
  creditAmount: z.coerce.number().min(0).default(0),
  transactionCurrencyDebit: z.coerce.number().min(0).default(0),
  transactionCurrencyCredit: z.coerce.number().min(0).default(0),
  exchangeRate: z.coerce.number().positive().default(1),
  description: optionalText,
  referenceNo: optionalText,
  costCenterId: z.string().uuid(),
  projectId: z.string().uuid(),
  reconciledAmount: z.coerce.number().min(0).default(0),
  isReconciled: z.boolean().default(false),
  status: z.enum(['ACTIVE', 'REVERSED']).default('ACTIVE'),
  vendorId: nullableUuid,
  customerId: nullableUuid,
});

export const updateJournalEntryLineBodySchema = createJournalEntryLineBodySchema
  .partial()
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'empty update payload',
  });

export const listJournalEntryLinesQuerySchema = paginationQuerySchema.extend({
  journalEntryId: z.string().uuid().optional(),
  accountId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
  costCenterId: z.string().uuid().optional(),
  vendorId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  status: z.enum(['ACTIVE', 'REVERSED']).optional(),
  isReconciled: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
  searchKey: z.string().trim().min(1).optional(),
});

export const journalEntryLineIdParamSchema = z.object({
  id: z.string().uuid('Invalid journal entry line ID'),
});
