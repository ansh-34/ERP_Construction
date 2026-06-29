import { errors } from './responses.js';

const idParam = {
  in: 'path',
  name: 'id',
  required: true,
  schema: { type: 'string', format: 'uuid' },
};

const fiscalYearObject = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    name: { type: 'string', example: 'FY 2026-2027' },
    startDate: { type: 'string', format: 'date', example: '2026-04-01' },
    endDate: { type: 'string', format: 'date', example: '2027-03-31' },
    isClosed: { type: 'boolean', example: false },
    closedAt: { type: 'string', format: 'date-time', nullable: true },
    closedBy: { type: 'string', format: 'uuid', nullable: true },
    closedByUserId: { type: 'string', format: 'uuid', nullable: true },
    adminId: { type: 'string', format: 'uuid' },
    domainId: { type: 'string', format: 'uuid' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

const createBody = {
  type: 'object',
  required: ['name', 'startDate', 'endDate'],
  additionalProperties: false,
  properties: {
    name: { type: 'string', maxLength: 100, example: 'FY 2026-2027' },
    startDate: { type: 'string', format: 'date', example: '2026-04-01' },
    endDate: { type: 'string', format: 'date', example: '2027-03-31' },
  },
};

const updateBody = {
  type: 'object',
  minProperties: 1,
  additionalProperties: false,
  properties: createBody.properties,
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
          data: fiscalYearObject,
        },
      },
    },
  },
});

const FiscalYearDomainPaths = {
  '/api/domain/fiscal-years': {
    post: {
      tags: ['Fiscal Years'],
      summary: 'Create a fiscal year',
      description:
        'Creates a non-overlapping fiscal year for the authenticated domain.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: createBody } },
      },
      responses: {
        201: singleResponse('Fiscal year created successfully'),
        ...errors,
      },
    },
    get: {
      tags: ['Fiscal Years'],
      summary: 'List fiscal years',
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
        { in: 'query', name: 'isClosed', schema: { type: 'boolean' } },
        { in: 'query', name: 'searchKey', schema: { type: 'string' } },
      ],
      responses: {
        200: {
          description: 'Fiscal years retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                  pagination: { type: 'object' },
                  data: { type: 'array', items: fiscalYearObject },
                },
              },
            },
          },
        },
        ...errors,
      },
    },
  },
  '/api/domain/fiscal-years/{id}': {
    get: {
      tags: ['Fiscal Years'],
      summary: 'Get a fiscal year',
      security: [{ bearerAuth: [] }],
      parameters: [idParam],
      responses: {
        200: singleResponse('Fiscal year retrieved successfully'),
        ...errors,
      },
    },
    put: {
      tags: ['Fiscal Years'],
      summary: 'Update an open fiscal year',
      security: [{ bearerAuth: [] }],
      parameters: [idParam],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: updateBody } },
      },
      responses: {
        200: singleResponse('Fiscal year updated successfully'),
        ...errors,
      },
    },
  },
  '/api/domain/fiscal-years/{id}/close': {
    patch: {
      tags: ['Fiscal Years'],
      summary: 'Close a fiscal year',
      description:
        'Permanently closes the fiscal year and records the closing admin and timestamp.',
      security: [{ bearerAuth: [] }],
      parameters: [idParam],
      responses: {
        200: singleResponse('Fiscal year closed successfully'),
        ...errors,
      },
    },
  },
};

export const FiscalYearPaths = {
  ...FiscalYearDomainPaths,
  '/api/user/fiscal-years': FiscalYearDomainPaths['/api/domain/fiscal-years'],
  '/api/user/fiscal-years/{id}':
    FiscalYearDomainPaths['/api/domain/fiscal-years/{id}'],
  '/api/user/fiscal-years/{id}/close':
    FiscalYearDomainPaths['/api/domain/fiscal-years/{id}/close'],
};
