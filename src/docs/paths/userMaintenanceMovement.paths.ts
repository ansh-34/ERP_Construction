import { errors } from './responses.js';

const security = [{ bearerAuth: [] }];
const languageHeader = {
  in: 'header' as const,
  name: 'language',
  schema: { type: 'string', default: 'en', example: 'en' },
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
    schema: { type: 'integer', default: 0 },
  },
  {
    in: 'query' as const,
    name: 'limit',
    schema: { type: 'integer', default: 10 },
  },
];
const assetFilters = [
  {
    in: 'query' as const,
    name: 'assetType',
    schema: { type: 'string', enum: ['VEHICLE', 'MACHINERY'] },
  },
  {
    in: 'query' as const,
    name: 'vehicleId',
    schema: { type: 'string', format: 'uuid' },
  },
  {
    in: 'query' as const,
    name: 'machineryId',
    schema: { type: 'string', format: 'uuid' },
  },
];
const dateFilters = [
  { in: 'query' as const, name: 'fromDate', schema: { type: 'string' } },
  { in: 'query' as const, name: 'toDate', schema: { type: 'string' } },
];
const movementType = {
  type: 'string',
  enum: [
    'WAREHOUSE',
    'WAREHOUSE_TO_SITE',
    'SITE_TO_WAREHOUSE',
    'PROJECT_SITE',
    'SITE_TO_SITE',
    'OTHER',
  ],
};

const itemResponse = (
  schema: string,
  message: string,
  statusCode: 200 | 201 = 200,
) => ({
  [statusCode]: {
    description: message,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            message: { type: 'string', example: message },
            data: { $ref: `#/components/schemas/${schema}` },
          },
        },
      },
    },
  },
  ...errors,
});

const listResponse = (schema: string, message: string) => ({
  200: {
    description: message,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            message: { type: 'string', example: message },
            pagination: { type: 'object' },
            data: {
              type: 'array',
              items: { $ref: `#/components/schemas/${schema}` },
            },
          },
        },
      },
    },
  },
  ...errors,
});

const jsonBody = (schema: string) => ({
  required: true,
  content: {
    'application/json': { schema: { $ref: `#/components/schemas/${schema}` } },
  },
});

export const UserMaintenanceMovementPaths = {
  '/api/user/maintenance-schedules': {
    get: {
      tags: ['User Maintenance Schedules'],
      summary: 'List permitted user maintenance schedules',
      security,
      parameters: [
        languageHeader,
        ...paginationParams,
        ...assetFilters,
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
        { in: 'query', name: 'searchKey', schema: { type: 'string' } },
        ...dateFilters,
      ],
      responses: listResponse(
        'MaintenanceScheduleObject',
        'Maintenance schedules fetched successfully',
      ),
    },
    post: {
      tags: ['User Maintenance Schedules'],
      summary: 'Create permitted user maintenance schedule',
      security,
      parameters: [languageHeader],
      requestBody: jsonBody('CreateMaintenanceScheduleBody'),
      responses: itemResponse(
        'MaintenanceScheduleObject',
        'Maintenance schedule created successfully',
        201,
      ),
    },
  },
  '/api/user/maintenance-schedules/{id}': {
    get: {
      tags: ['User Maintenance Schedules'],
      summary: 'Get permitted user maintenance schedule by ID',
      security,
      parameters: [languageHeader, idParam],
      responses: itemResponse(
        'MaintenanceScheduleObject',
        'Maintenance schedule fetched successfully',
      ),
    },
    put: {
      tags: ['User Maintenance Schedules'],
      summary: 'Update permitted user maintenance schedule',
      security,
      parameters: [languageHeader, idParam],
      requestBody: jsonBody('UpdateMaintenanceScheduleBody'),
      responses: itemResponse(
        'MaintenanceScheduleObject',
        'Maintenance schedule updated successfully',
      ),
    },
    delete: {
      tags: ['User Maintenance Schedules'],
      summary: 'Delete permitted user maintenance schedule',
      security,
      parameters: [idParam],
      responses: itemResponse(
        'MaintenanceScheduleObject',
        'Maintenance schedule deleted successfully',
      ),
    },
  },
  '/api/user/maintenance-schedules/{id}/advance': {
    put: {
      tags: ['User Maintenance Schedules'],
      summary: 'Advance permitted user maintenance schedule',
      security,
      parameters: [languageHeader, idParam],
      requestBody: jsonBody('AdvanceMaintenanceScheduleBody'),
      responses: itemResponse(
        'MaintenanceScheduleObject',
        'Maintenance schedule advanced successfully',
      ),
    },
  },
  '/api/user/maintenance-logs': {
    get: {
      tags: ['User Maintenance Logs'],
      summary: 'List permitted user maintenance logs',
      security,
      parameters: [
        languageHeader,
        ...paginationParams,
        ...assetFilters,
        {
          in: 'query',
          name: 'maintenanceScheduleId',
          schema: { type: 'string', format: 'uuid' },
        },
        { in: 'query', name: 'searchKey', schema: { type: 'string' } },
        ...dateFilters,
      ],
      responses: listResponse(
        'MaintenanceLogObject',
        'Maintenance logs fetched successfully',
      ),
    },
    post: {
      tags: ['User Maintenance Logs'],
      summary: 'Create permitted user maintenance log',
      security,
      parameters: [languageHeader],
      requestBody: jsonBody('CreateMaintenanceLogBody'),
      responses: itemResponse(
        'MaintenanceLogObject',
        'Maintenance log created successfully',
        201,
      ),
    },
  },
  '/api/user/maintenance-logs/{id}': {
    get: {
      tags: ['User Maintenance Logs'],
      summary: 'Get permitted user maintenance log by ID',
      security,
      parameters: [languageHeader, idParam],
      responses: itemResponse(
        'MaintenanceLogObject',
        'Maintenance log fetched successfully',
      ),
    },
    delete: {
      tags: ['User Maintenance Logs'],
      summary: 'Delete permitted user maintenance log',
      security,
      parameters: [idParam],
      responses: itemResponse(
        'MaintenanceLogObject',
        'Maintenance log deleted successfully',
      ),
    },
  },
  '/api/user/maintenance-reports': {
    get: {
      tags: ['User Maintenance Reports'],
      summary: 'Get permitted user maintenance analytics',
      description:
        'Calculated from maintenance logs. Requires MAINTENANCE_LOG READ permission.',
      security,
      parameters: [
        {
          in: 'query',
          name: 'groupBy',
          schema: {
            type: 'string',
            enum: ['DAY', 'WEEK', 'MONTH', 'YEAR'],
            default: 'MONTH',
          },
        },
        ...assetFilters,
        ...dateFilters,
      ],
      responses: itemResponse(
        'MaintenanceReportObject',
        'Maintenance report fetched successfully',
      ),
    },
  },
  '/api/user/movement-logs': {
    get: {
      tags: ['User Movement Logs'],
      summary: 'List permitted user movement logs',
      security,
      parameters: [
        ...paginationParams,
        ...assetFilters,
        { in: 'query', name: 'movementType', schema: movementType },
        {
          in: 'query',
          name: 'projectId',
          schema: { type: 'string', format: 'uuid' },
        },
        { in: 'query', name: 'searchKey', schema: { type: 'string' } },
        ...dateFilters,
      ],
      responses: listResponse(
        'MovementLogObject',
        'Movement logs fetched successfully',
      ),
    },
    post: {
      tags: ['User Movement Logs'],
      summary: 'Create permitted user movement log',
      security,
      requestBody: jsonBody('CreateMovementLogBody'),
      responses: itemResponse(
        'MovementLogObject',
        'Movement log created successfully',
        201,
      ),
    },
  },
  '/api/user/movement-logs/{id}': {
    get: {
      tags: ['User Movement Logs'],
      summary: 'Get permitted user movement log by ID',
      security,
      parameters: [idParam],
      responses: itemResponse(
        'MovementLogObject',
        'Movement log fetched successfully',
      ),
    },
    delete: {
      tags: ['User Movement Logs'],
      summary: 'Delete permitted user movement log',
      security,
      parameters: [idParam],
      responses: itemResponse(
        'MovementLogObject',
        'Movement log deleted successfully',
      ),
    },
  },
  '/api/user/movement-reports': {
    get: {
      tags: ['User Movement Reports'],
      summary: 'Get permitted user movement analytics',
      description:
        'Calculated from movement logs. Requires MOVEMENT_LOG READ permission.',
      security,
      parameters: [
        ...assetFilters,
        { in: 'query', name: 'movementType', schema: movementType },
        {
          in: 'query',
          name: 'projectId',
          schema: { type: 'string', format: 'uuid' },
        },
        ...dateFilters,
      ],
      responses: itemResponse(
        'MovementReportObject',
        'Movement report fetched successfully',
      ),
    },
  },
};
