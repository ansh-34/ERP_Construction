import { errors } from './responses.js';

const languageHeader = {
  in: 'header' as const,
  name: 'language',
  schema: { type: 'string', default: 'en', example: 'en' },
};

const domainIdQuery = {
  in: 'query' as const,
  name: 'domainId',
  required: true,
  schema: { type: 'string', format: 'uuid' },
};

const idParam = {
  in: 'path' as const,
  name: 'id',
  required: true,
  schema: { type: 'string', format: 'uuid' },
};

const paginationParams = [
  {
    in: 'query' as const,
    name: 'offset',
    schema: { type: 'integer', minimum: 0, default: 0 },
  },
  {
    in: 'query' as const,
    name: 'limit',
    schema: { type: 'integer', minimum: 1, default: 10 },
  },
];

const listResponse = {
  200: {
    description: 'Maintenance logs fetched successfully',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Maintenance logs fetched successfully',
            },
            pagination: {
              type: 'object',
              properties: {
                currentCount: { type: 'integer', example: 10 },
                totalCount: { type: 'integer', example: 42 },
                offset: { type: 'integer', example: 0 },
                limit: { type: 'integer', example: 10 },
              },
            },
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/MaintenanceLogObject' },
            },
          },
        },
      },
    },
  },
  ...errors,
};

const itemResponse = (message: string, statusCode: 200 | 201 = 200) => ({
  [statusCode]: {
    description: message,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            message: { type: 'string', example: message },
            data: { $ref: '#/components/schemas/MaintenanceLogObject' },
          },
        },
      },
    },
  },
  ...errors,
});

export const MaintenanceLogPaths = {
  '/api/domain/maintenance-logs': {
    get: {
      tags: ['Domain Maintenance Logs'],
      summary: 'List maintenance logs',
      security: [{ bearerAuth: [] }],
      parameters: [
        languageHeader,
        domainIdQuery,
        ...paginationParams,
        {
          in: 'query',
          name: 'assetType',
          schema: { type: 'string', enum: ['VEHICLE', 'MACHINERY'] },
        },
        {
          in: 'query',
          name: 'vehicleId',
          schema: { type: 'string', format: 'uuid' },
        },
        {
          in: 'query',
          name: 'machineryId',
          schema: { type: 'string', format: 'uuid' },
        },
        {
          in: 'query',
          name: 'maintenanceScheduleId',
          schema: { type: 'string', format: 'uuid' },
        },
        { in: 'query', name: 'searchKey', schema: { type: 'string' } },
        { in: 'query', name: 'fromDate', schema: { type: 'string' } },
        { in: 'query', name: 'toDate', schema: { type: 'string' } },
      ],
      responses: listResponse,
    },
    post: {
      tags: ['Domain Maintenance Logs'],
      summary: 'Create maintenance log',
      security: [{ bearerAuth: [] }],
      parameters: [languageHeader],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/CreateMaintenanceLogBody',
            },
          },
        },
      },
      responses: itemResponse('Maintenance log created successfully', 201),
    },
  },
  '/api/domain/maintenance-logs/{id}': {
    get: {
      tags: ['Domain Maintenance Logs'],
      summary: 'Get maintenance log by ID',
      security: [{ bearerAuth: [] }],
      parameters: [languageHeader, idParam, domainIdQuery],
      responses: itemResponse('Maintenance log fetched successfully'),
    },
    delete: {
      tags: ['Domain Maintenance Logs'],
      summary: 'Delete maintenance log',
      security: [{ bearerAuth: [] }],
      parameters: [idParam, domainIdQuery],
      responses: itemResponse('Maintenance log deleted successfully'),
    },
  },
};
