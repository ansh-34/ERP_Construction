import { errors } from './responses.js';

const idParam = {
  in: 'path',
  name: 'id',
  required: true,
  schema: { type: 'string', format: 'uuid' },
};

const periodObject = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    fiscalYearId: { type: 'string', format: 'uuid' },
    name: { type: 'string', example: 'April 2026' },
    periodNo: { type: 'integer', minimum: 1, maximum: 12, example: 1 },
    startDate: { type: 'string', format: 'date', example: '2026-04-01' },
    endDate: { type: 'string', format: 'date', example: '2026-04-30' },
    isClosed: { type: 'boolean' },
    closedAt: { type: 'string', format: 'date-time', nullable: true },
    closedBy: { type: 'string', format: 'uuid', nullable: true },
    closedByUserId: { type: 'string', format: 'uuid', nullable: true },
    domainId: { type: 'string', format: 'uuid' },
    adminId: { type: 'string', format: 'uuid' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

const createBody = {
  type: 'object',
  required: ['fiscalYearId', 'name', 'periodNo', 'startDate', 'endDate'],
  additionalProperties: false,
  properties: {
    fiscalYearId: { type: 'string', format: 'uuid' },
    name: { type: 'string', maxLength: 100, example: 'April 2026' },
    periodNo: { type: 'integer', minimum: 1, maximum: 12, example: 1 },
    startDate: { type: 'string', format: 'date', example: '2026-04-01' },
    endDate: { type: 'string', format: 'date', example: '2026-04-30' },
  },
};

const updateBody = {
  type: 'object',
  minProperties: 1,
  additionalProperties: false,
  properties: {
    name: createBody.properties.name,
    periodNo: createBody.properties.periodNo,
    startDate: createBody.properties.startDate,
    endDate: createBody.properties.endDate,
  },
};

const singleResponse = (description: string) => ({
  description,
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: periodObject,
        },
      },
    },
  },
});

const AccountingPeriodDomainPaths = {
  '/api/domain/accounting-periods': {
    post: {
      tags: ['Accounting Periods'],
      summary: 'Create an accounting period',
      description:
        'Creates a monthly period inside an open fiscal year. Period dates cannot overlap.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: createBody } },
      },
      responses: {
        201: singleResponse('Accounting period created successfully'),
        ...errors,
      },
    },
    get: {
      tags: ['Accounting Periods'],
      summary: 'List accounting periods',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'query',
          name: 'offset',
          schema: { type: 'integer', minimum: 0 },
        },
        {
          in: 'query',
          name: 'limit',
          schema: { type: 'integer', minimum: 1, maximum: 100 },
        },
        {
          in: 'query',
          name: 'fiscalYearId',
          schema: { type: 'string', format: 'uuid' },
        },
        { in: 'query', name: 'isClosed', schema: { type: 'boolean' } },
        { in: 'query', name: 'searchKey', schema: { type: 'string' } },
      ],
      responses: {
        200: {
          description: 'Accounting periods retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                  pagination: { type: 'object' },
                  data: { type: 'array', items: periodObject },
                },
              },
            },
          },
        },
        ...errors,
      },
    },
  },
  '/api/domain/accounting-periods/{id}': {
    get: {
      tags: ['Accounting Periods'],
      summary: 'Get an accounting period',
      security: [{ bearerAuth: [] }],
      parameters: [idParam],
      responses: {
        200: singleResponse('Accounting period retrieved successfully'),
        ...errors,
      },
    },
    put: {
      tags: ['Accounting Periods'],
      summary: 'Update an open accounting period',
      security: [{ bearerAuth: [] }],
      parameters: [idParam],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: updateBody } },
      },
      responses: {
        200: singleResponse('Accounting period updated successfully'),
        ...errors,
      },
    },
  },
  '/api/domain/accounting-periods/{id}/close': {
    patch: {
      tags: ['Accounting Periods'],
      summary: 'Close an accounting period',
      description:
        'Closes the period and records the authenticated admin and timestamp.',
      security: [{ bearerAuth: [] }],
      parameters: [idParam],
      responses: {
        200: singleResponse('Accounting period closed successfully'),
        ...errors,
      },
    },
  },
};

export const AccountingPeriodPaths = {
  ...AccountingPeriodDomainPaths,
  '/api/user/accounting-periods':
    AccountingPeriodDomainPaths['/api/domain/accounting-periods'],
  '/api/user/accounting-periods/{id}':
    AccountingPeriodDomainPaths['/api/domain/accounting-periods/{id}'],
  '/api/user/accounting-periods/{id}/close':
    AccountingPeriodDomainPaths['/api/domain/accounting-periods/{id}/close'],
};
