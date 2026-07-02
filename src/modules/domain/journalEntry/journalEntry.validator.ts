import { z } from 'zod';
import { paginationQuerySchema } from '../../common/common.validator.js';

const dateOnly = z
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

const optionalText = z.string().trim().min(1).max(500).nullable().optional();
const nullableUuid = z.string().uuid().nullable().optional();

const nestedJournalEntryLineSchema = z
  .object({
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
    vendorId: nullableUuid,
    customerId: nullableUuid,
  })
  .refine(
    (line) =>
      (line.debitAmount > 0 && line.creditAmount === 0) ||
      (line.creditAmount > 0 && line.debitAmount === 0),
    {
      message: 'Exactly one of debitAmount or creditAmount must be positive',
    },
  )
  .refine(
    (line) =>
      line.reconciledAmount <= Math.max(line.debitAmount, line.creditAmount),
    {
      message: 'Reconciled amount cannot exceed the line amount',
      path: ['reconciledAmount'],
    },
  );

export const createJournalEntryBodySchema = z
  .object({
    voucherNo: z.string().trim().min(1).max(100),
    voucherType: z.string().trim().min(1).max(100),
    transactionDate: dateOnly,
    postingDate: dateOnly,
    referenceNo: optionalText,
    externalReferenceNo: optionalText,
    narration: optionalText,
    totalDebit: z.coerce.number().min(0).optional(),
    totalCredit: z.coerce.number().min(0).optional(),
    currencyId: z.string().uuid(),
    exchangeRate: z.coerce.number().positive().default(1),
    entryType: z.enum(['AUTO', 'MANUAL']),
    sourceDocumentId: nullableUuid,
    sourceDocumentType: optionalText,
    isAdjustment: z.boolean().default(false),
    isYearEndClosing: z.boolean().default(false),
    fiscalYearId: z.string().uuid(),
    accountingPeriodId: z.string().uuid(),
    vendorId: nullableUuid,
    customerId: nullableUuid,
    costCenterId: z.string().uuid(),
    projectId: z.string().uuid(),
    lines: z.array(nestedJournalEntryLineSchema).min(2).optional(),
  })
  .superRefine((data, context) => {
    const lineNumbers = new Set<number>();
    (data.lines ?? []).forEach((line, index) => {
      if (lineNumbers.has(line.lineNo)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Journal entry line numbers must be unique',
          path: ['lines', index, 'lineNo'],
        });
      }
      lineNumbers.add(line.lineNo);
    });
  });

export const updateJournalEntryBodySchema = z
  .object({
    voucherNo: z.string().trim().min(1).max(100).optional(),
    voucherType: z.string().trim().min(1).max(100).optional(),
    transactionDate: dateOnly.optional(),
    postingDate: dateOnly.optional(),
    referenceNo: optionalText,
    externalReferenceNo: optionalText,
    narration: optionalText,
    totalDebit: z.coerce.number().min(0).optional(),
    totalCredit: z.coerce.number().min(0).optional(),
    currencyId: z.string().uuid().optional(),
    exchangeRate: z.coerce.number().positive().optional(),
    entryType: z.enum(['AUTO', 'MANUAL']).optional(),
    sourceDocumentId: nullableUuid,
    sourceDocumentType: optionalText,
    isAdjustment: z.boolean().optional(),
    isYearEndClosing: z.boolean().optional(),
    fiscalYearId: z.string().uuid().optional(),
    accountingPeriodId: z.string().uuid().optional(),
    vendorId: nullableUuid,
    customerId: nullableUuid,
    costCenterId: z.string().uuid().optional(),
    projectId: z.string().uuid().optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'empty update payload',
  });

const optionalDateQuery = z.preprocess(
  (value) => (value === '' ? undefined : value),
  dateOnly.optional(),
);

export const listJournalEntriesQuerySchema = paginationQuerySchema.extend({
  status: z.enum(['DRAFT', 'POSTED', 'REVERSED']).optional(),
  entryType: z.enum(['AUTO', 'MANUAL']).optional(),
  voucherType: z.string().trim().min(1).optional(),
  fiscalYearId: z.string().uuid().optional(),
  accountingPeriodId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
  costCenterId: z.string().uuid().optional(),
  fromDate: optionalDateQuery,
  toDate: optionalDateQuery,
  searchKey: z.string().trim().min(1).optional(),
});

export const journalEntryIdParamSchema = z.object({
  id: z.string().uuid('Invalid journal entry ID'),
});
