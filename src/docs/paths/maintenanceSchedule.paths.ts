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
    description: 'Maintenance schedules fetched successfully',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Maintenance schedules fetched successfully',
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
              items: { $ref: '#/components/schemas/MaintenanceScheduleObject' },
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
            data: { $ref: '#/components/schemas/MaintenanceScheduleObject' },
          },
        },
      },
    },
  },
  ...errors,
});

export const MaintenanceSchedulePaths = {
  '/api/domain/maintenance-schedules': {
    get: {
      tags: ['Domain Maintenance Schedules'],
      summary: 'List maintenance schedules',
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
          name: 'scheduleStatus',
          schema: {
            type: 'string',
            enum: [
              'SCHEDULED',
              'OVERDUE',
              'IN_PROGRESS',
              'COMPLETED',
              'CANCELLED',
            ],
          },
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
        { in: 'query', name: 'searchKey', schema: { type: 'string' } },
        { in: 'query', name: 'fromDate', schema: { type: 'string' } },
        { in: 'query', name: 'toDate', schema: { type: 'string' } },
      ],
      responses: listResponse,
    },
    post: {
      tags: ['Domain Maintenance Schedules'],
      summary: 'Create maintenance schedule',
      security: [{ bearerAuth: [] }],
      parameters: [languageHeader],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/CreateMaintenanceScheduleBody',
            },
          },
        },
      },
      responses: itemResponse('Maintenance schedule created successfully', 201),
    },
  },
  '/api/domain/maintenance-schedules/{id}': {
    get: {
      tags: ['Domain Maintenance Schedules'],
      summary: 'Get maintenance schedule by ID',
      security: [{ bearerAuth: [] }],
      parameters: [languageHeader, idParam, domainIdQuery],
      responses: itemResponse('Maintenance schedule fetched successfully'),
    },
    put: {
      tags: ['Domain Maintenance Schedules'],
      summary: 'Update maintenance schedule',
      security: [{ bearerAuth: [] }],
      parameters: [languageHeader, idParam, domainIdQuery],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/UpdateMaintenanceScheduleBody',
            },
          },
        },
      },
      responses: itemResponse('Maintenance schedule updated successfully'),
    },
    delete: {
      tags: ['Domain Maintenance Schedules'],
      summary: 'Delete maintenance schedule',
      security: [{ bearerAuth: [] }],
      parameters: [idParam, domainIdQuery],
      responses: itemResponse('Maintenance schedule deleted successfully'),
    },
  },
  '/api/domain/maintenance-schedules/{id}/advance': {
    put: {
      tags: ['Domain Maintenance Schedules'],
      summary: 'Advance maintenance schedule next due date',
      security: [{ bearerAuth: [] }],
      parameters: [languageHeader, idParam, domainIdQuery],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/AdvanceMaintenanceScheduleBody',
            },
          },
        },
      },
      responses: itemResponse('Maintenance schedule advanced successfully'),
    },
  },
};
