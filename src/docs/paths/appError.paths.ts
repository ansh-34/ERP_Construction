import { errors } from './responses.js';

export const AppErrorPaths = {
  '/api/domain/app-errors': {
    get: {
      tags: ['App Errors'],
      summary: 'List app errors',
      security: [{ bearerAuth: [] }],
      parameters: [
        { in: 'query', name: 'offset', schema: { type: 'integer', minimum: 0 } },
        { in: 'query', name: 'limit', schema: { type: 'integer', minimum: 1, maximum: 100 } },
        { in: 'query', name: 'from', schema: { type: 'string', format: 'date-time' } },
        { in: 'query', name: 'to', schema: { type: 'string', format: 'date-time' } },
      ],
      responses: {
        200: {
          description: 'App errors retrieved',
          content: { 'application/json': { schema: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              message: { type: 'string', example: 'App errors retrieved' },
              pagination: { type: 'object', properties: { currentCount: { type: 'integer' }, totalCount: { type: 'integer' }, offset: { type: 'integer' }, limit: { type: 'integer' } } },
              data: { type: 'array', items: { type: 'object', properties: { id: { type: 'string', format: 'uuid' }, deviceName: { type: 'string' }, version: { type: 'string' }, error: { type: 'string' }, functionName: { type: 'string' }, domainId: { type: 'string', format: 'uuid' }, createdAt: { type: 'string', format: 'date-time' } } } },
            },
          } } },
        },
        ...errors,
      },
    },
    post: {
      tags: ['App Errors'],
      summary: 'Create app error entry',
      security: [{ bearerAuth: [] }],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateAppErrorBody' } } } },
      responses: {
        201: {
          description: 'App error created',
          content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, message: { type: 'string', example: 'App error created' }, data: { type: 'object', properties: { id: { type: 'string', format: 'uuid' }, deviceName: { type: 'string' }, version: { type: 'string' }, error: { type: 'string' }, functionName: { type: 'string' }, createdAt: { type: 'string', format: 'date-time' } } } } } } },
        },
        ...errors,
      },
    },
  },
};
