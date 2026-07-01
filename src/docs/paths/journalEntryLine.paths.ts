import { errors } from './responses.js';

const id = {
  in: 'path',
  name: 'id',
  required: true,
  schema: { type: 'string', format: 'uuid' },
};

const lineBody = {
  type: 'object',
  required: [
    'journalEntryId',
    'lineNo',
    'accountId',
    'costCenterId',
    'projectId',
  ],
  properties: {
    journalEntryId: { type: 'string', format: 'uuid' },
    lineNo: { type: 'integer', minimum: 1 },
    accountId: { type: 'string', format: 'uuid' },
    debitAmount: { type: 'number', minimum: 0, default: 0 },
    creditAmount: { type: 'number', minimum: 0, default: 0 },
    transactionCurrencyDebit: {
      type: 'number',
      minimum: 0,
      default: 0,
    },
    transactionCurrencyCredit: {
      type: 'number',
      minimum: 0,
      default: 0,
    },
    exchangeRate: { type: 'number', exclusiveMinimum: 0, default: 1 },
    description: { type: 'string', nullable: true },
    referenceNo: { type: 'string', nullable: true },
    costCenterId: { type: 'string', format: 'uuid' },
    projectId: { type: 'string', format: 'uuid' },
    reconciledAmount: { type: 'number', minimum: 0, default: 0 },
    isReconciled: { type: 'boolean', default: false },
    status: {
      type: 'string',
      enum: ['ACTIVE', 'REVERSED'],
      default: 'ACTIVE',
    },
    vendorId: { type: 'string', format: 'uuid', nullable: true },
    customerId: { type: 'string', format: 'uuid', nullable: true },
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

export const JournalEntryLinePaths = {
  '/api/domain/journal-entry-lines': {
    post: {
      tags: ['Journal Entry Lines'],
      summary: 'Create a line for a DRAFT journal entry',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: lineBody } },
      },
      responses: {
        201: response('Journal entry line created successfully'),
        ...errors,
      },
    },
    get: {
      tags: ['Journal Entry Lines'],
      summary: 'List journal entry lines',
      security: [{ bearerAuth: [] }],
      parameters: [
        { in: 'query', name: 'offset', schema: { type: 'integer' } },
        { in: 'query', name: 'limit', schema: { type: 'integer' } },
        {
          in: 'query',
          name: 'journalEntryId',
          schema: { type: 'string', format: 'uuid' },
        },
        {
          in: 'query',
          name: 'accountId',
          schema: { type: 'string', format: 'uuid' },
        },
        {
          in: 'query',
          name: 'status',
          schema: { type: 'string', enum: ['ACTIVE', 'REVERSED'] },
        },
        { in: 'query', name: 'isReconciled', schema: { type: 'boolean' } },
        { in: 'query', name: 'searchKey', schema: { type: 'string' } },
      ],
      responses: {
        200: response('Journal entry lines retrieved successfully'),
        ...errors,
      },
    },
  },
  '/api/domain/journal-entry-lines/{id}': {
    get: {
      tags: ['Journal Entry Lines'],
      summary: 'Get a journal entry line',
      security: [{ bearerAuth: [] }],
      parameters: [id],
      responses: {
        200: response('Journal entry line retrieved successfully'),
        ...errors,
      },
    },
    put: {
      tags: ['Journal Entry Lines'],
      summary: 'Update a line belonging to a DRAFT journal entry',
      security: [{ bearerAuth: [] }],
      parameters: [id],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: lineBody } },
      },
      responses: {
        200: response('Journal entry line updated successfully'),
        ...errors,
      },
    },
    delete: {
      tags: ['Journal Entry Lines'],
      summary: 'Delete a line belonging to a DRAFT journal entry',
      security: [{ bearerAuth: [] }],
      parameters: [id],
      responses: {
        200: response('Journal entry line deleted successfully'),
        ...errors,
      },
    },
  },
};
