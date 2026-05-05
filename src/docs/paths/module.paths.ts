import { errors } from './responses.js';

export const ModulePaths = {
  '/api/superAdmin/modules': {
    get: {
      tags: ['Modules'],
      summary: 'List modules',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Modules retrieved',
          content: { 'application/json': { schema: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              message: { type: 'string', example: 'Modules retrieved' },
              pagination: { type: 'object', properties: { currentCount: { type: 'integer' }, totalCount: { type: 'integer' }, offset: { type: 'integer' }, limit: { type: 'integer' } } },
              data: { type: 'array', items: { type: 'object', properties: { id: { type: 'string', format: 'uuid' }, name: { type: 'object' }, code: { type: 'string' }, status: { type: 'string' }, createdAt: { type: 'string', format: 'date-time' } } } },
            },
          } } },
        },
        ...errors,
      },
    },
    post: {
      tags: ['Modules'],
      summary: 'Create module',
      security: [{ bearerAuth: [] }],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateModuleBody' } } } },
      responses: {
        201: {
          description: 'Module created',
          content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, message: { type: 'string', example: 'Module created' }, data: { type: 'object', properties: { id: { type: 'string', format: 'uuid' }, name: { type: 'object' }, code: { type: 'string' }, status: { type: 'string' }, createdAt: { type: 'string', format: 'date-time' } } } } } } },
        },
        ...errors,
      },
    },
  },
  '/api/superAdmin/modules/{id}': {
    put: {
      tags: ['Modules'],
      summary: 'Update module',
      security: [{ bearerAuth: [] }],
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateModuleBody' } } } },
      responses: {
        200: {
          description: 'Module updated',
          content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, message: { type: 'string', example: 'Module updated' }, data: { type: 'object' } } } } },
        },
        ...errors,
      },
    },
    delete: {
      tags: ['Modules'],
      summary: 'Delete module',
      security: [{ bearerAuth: [] }],
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
      responses: {
        200: {
          description: 'Module deleted',
          content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, message: { type: 'string', example: 'Module deleted' } } } } },
        },
        ...errors,
      },
    },
  },
};
