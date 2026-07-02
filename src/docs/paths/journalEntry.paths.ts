import { errors } from './responses.js';

type SwaggerOperation = {
  tags?: string[];
  description?: string;
  [key: string]: unknown;
};

type SwaggerPathItem = Record<string, SwaggerOperation>;

const id = {
  in: 'path',
  name: 'id',
  required: true,
  schema: { type: 'string', format: 'uuid' },
};

const journalBody = {
  type: 'object',
  required: [
    'voucherNo',
    'voucherType',
    'transactionDate',
    'postingDate',
    'currencyId',
    'entryType',
    'fiscalYearId',
    'accountingPeriodId',
    'costCenterId',
    'projectId',
  ],
  properties: {
    voucherNo: { type: 'string', example: 'JV-2026-0001' },
    voucherType: { type: 'string', example: 'JOURNAL' },
    transactionDate: {
      type: 'string',
      format: 'date',
      example: '2026-04-15',
    },
    postingDate: {
      type: 'string',
      format: 'date',
      example: '2026-04-15',
    },
    referenceNo: { type: 'string', nullable: true },
    externalReferenceNo: { type: 'string', nullable: true },
    narration: { type: 'string', nullable: true },
    totalDebit: { type: 'number', minimum: 0 },
    totalCredit: { type: 'number', minimum: 0 },
    currencyId: { type: 'string', format: 'uuid' },
    exchangeRate: { type: 'number', exclusiveMinimum: 0 },
    entryType: { type: 'string', enum: ['AUTO', 'MANUAL'] },
    sourceDocumentId: { type: 'string', format: 'uuid', nullable: true },
    sourceDocumentType: { type: 'string', nullable: true },
    isAdjustment: { type: 'boolean' },
    isYearEndClosing: { type: 'boolean' },
    fiscalYearId: { type: 'string', format: 'uuid' },
    accountingPeriodId: { type: 'string', format: 'uuid' },
    vendorId: { type: 'string', format: 'uuid', nullable: true },
    customerId: { type: 'string', format: 'uuid', nullable: true },
    costCenterId: { type: 'string', format: 'uuid' },
    projectId: { type: 'string', format: 'uuid' },
  },
};

const response = (description: string) => ({
  description,
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: { type: 'object' },
        },
      },
    },
  },
});

const domainJournalEntryPaths: Record<string, SwaggerPathItem> = {
  '/api/domain/journal-entries': {
    post: {
      tags: ['Journal Entries'],
      summary: 'Create a DRAFT journal entry',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: journalBody } },
      },
      responses: {
        201: response('Journal entry created successfully'),
        ...errors,
      },
    },
    get: {
      tags: ['Journal Entries'],
      summary: 'List journal entries',
      security: [{ bearerAuth: [] }],
      parameters: [
        { in: 'query', name: 'offset', schema: { type: 'integer' } },
        { in: 'query', name: 'limit', schema: { type: 'integer' } },
        {
          in: 'query',
          name: 'status',
          schema: { type: 'string', enum: ['DRAFT', 'POSTED', 'REVERSED'] },
        },
        {
          in: 'query',
          name: 'entryType',
          schema: { type: 'string', enum: ['AUTO', 'MANUAL'] },
        },
        { in: 'query', name: 'voucherType', schema: { type: 'string' } },
        {
          in: 'query',
          name: 'fiscalYearId',
          schema: { type: 'string', format: 'uuid' },
        },
        {
          in: 'query',
          name: 'accountingPeriodId',
          schema: { type: 'string', format: 'uuid' },
        },
        { in: 'query', name: 'searchKey', schema: { type: 'string' } },
      ],
      responses: {
        200: response('Journal entries retrieved successfully'),
        ...errors,
      },
    },
  },
  '/api/domain/journal-entries/{id}': {
    get: {
      tags: ['Journal Entries'],
      summary: 'Get a journal entry',
      security: [{ bearerAuth: [] }],
      parameters: [id],
      responses: {
        200: response('Journal entry retrieved successfully'),
        ...errors,
      },
    },
    put: {
      tags: ['Journal Entries'],
      summary: 'Update a DRAFT journal entry',
      security: [{ bearerAuth: [] }],
      parameters: [id],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: journalBody } },
      },
      responses: {
        200: response('Journal entry updated successfully'),
        ...errors,
      },
    },
    delete: {
      tags: ['Journal Entries'],
      summary: 'Delete a DRAFT journal entry',
      security: [{ bearerAuth: [] }],
      parameters: [id],
      responses: {
        200: response('Journal entry deleted successfully'),
        ...errors,
      },
    },
  },
  '/api/domain/journal-entries/{id}/post': {
    post: {
      tags: ['Journal Entries'],
      summary: 'Post a DRAFT journal entry',
      description:
        'Validates balanced active lines, creates GeneralLedgerEntry rows for leaf posting accounts with a signed running balance per account and cost center, rolls AccountBalance movements up to each leaf and every parent account in its materialized path, and permanently changes the journal to POSTED.',
      security: [{ bearerAuth: [] }],
      parameters: [id],
      responses: {
        200: response('Journal entry posted successfully'),
        ...errors,
      },
    },
  },
  '/api/domain/journal-entries/{id}/reverse': {
    post: {
      tags: ['Journal Entries'],
      summary: 'Reverse a POSTED journal entry',
      description:
        'Creates new REVERSED lines with swapped debit/credit, creates opposite GeneralLedgerEntry rows, offsets AccountBalance, and changes the journal to REVERSED.',
      security: [{ bearerAuth: [] }],
      parameters: [id],
      responses: {
        200: response('Journal entry debit and credit reversed successfully'),
        ...errors,
      },
    },
  },
};

const userJournalEntryPaths = Object.fromEntries(
  Object.entries(domainJournalEntryPaths).map(([path, pathItem]) => [
    path.replace('/api/domain/', '/api/user/'),
    Object.fromEntries(
      Object.entries(pathItem).map(([method, operation]) => [
        method,
        {
          ...operation,
          tags: ['User Journal Entries'],
          description: [
            operation.description,
            'Requires the corresponding JOURNAL_ENTRY role permission. Posting and reversal require APPROVE.',
          ]
            .filter(Boolean)
            .join(' '),
        },
      ]),
    ),
  ]),
);

export const JournalEntryPaths = {
  ...domainJournalEntryPaths,
  ...userJournalEntryPaths,
};
