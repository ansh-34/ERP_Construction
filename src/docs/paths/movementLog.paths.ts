import { errors } from './responses.js';

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

const itemResponse = (message: string, statusCode: 200 | 201 = 200) => ({
  [statusCode]: {
    description: message,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            message: { type: 'string', example: message },
            data: { $ref: '#/components/schemas/MovementLogObject' },
          },
        },
      },
    },
  },
  ...errors,
});

export const MovementLogPaths = {
  '/api/domain/movement-logs': {
    get: {
      tags: ['Domain Movement Logs'],
      summary: 'List movement logs',
      security: [{ bearerAuth: [] }],
      parameters: [
        domainIdQuery,
        {
          in: 'query',
          name: 'offset',
          schema: { type: 'integer', default: 0 },
        },
        {
          in: 'query',
          name: 'limit',
          schema: { type: 'integer', default: 10 },
        },
        {
          in: 'query',
          name: 'assetType',
          schema: { type: 'string', enum: ['VEHICLE', 'MACHINERY'] },
        },
        { in: 'query', name: 'movementType', schema: movementType },
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
          name: 'projectId',
          schema: { type: 'string', format: 'uuid' },
        },
        { in: 'query', name: 'searchKey', schema: { type: 'string' } },
        { in: 'query', name: 'fromDate', schema: { type: 'string' } },
        { in: 'query', name: 'toDate', schema: { type: 'string' } },
      ],
      responses: {
        200: {
          description: 'Movement logs fetched successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                  pagination: { type: 'object' },
                  data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/MovementLogObject' },
                  },
                },
              },
            },
          },
        },
        ...errors,
      },
    },
    post: {
      tags: ['Domain Movement Logs'],
      summary: 'Create movement log',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateMovementLogBody' },
          },
        },
      },
      responses: itemResponse('Movement log created successfully', 201),
    },
  },
  '/api/domain/movement-logs/{id}': {
    get: {
      tags: ['Domain Movement Logs'],
      summary: 'Get movement log by ID',
      security: [{ bearerAuth: [] }],
      parameters: [idParam, domainIdQuery],
      responses: itemResponse('Movement log fetched successfully'),
    },
    delete: {
      tags: ['Domain Movement Logs'],
      summary: 'Delete movement log',
      security: [{ bearerAuth: [] }],
      parameters: [idParam, domainIdQuery],
      responses: itemResponse('Movement log deleted successfully'),
    },
  },
};
