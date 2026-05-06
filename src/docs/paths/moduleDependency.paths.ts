import { errors } from './responses.js';

export const ModuleDependencyPaths = {
  '/api/superAdmin/module-dependencies': {
    get: {
      tags: ['Module Dependencies'],
      summary: 'List module dependencies',
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
      ],
      responses: {
        200: {
          description: 'Module dependencies retrieved',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example: 'Module dependencies retrieved',
                  },
                  pagination: {
                    type: 'object',
                    properties: {
                      currentCount: { type: 'integer' },
                      totalCount: { type: 'integer' },
                      offset: { type: 'integer' },
                      limit: { type: 'integer' },
                    },
                  },
                  data: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', format: 'uuid' },
                        moduleId: { type: 'string', format: 'uuid' },
                        dependentModuleId: { type: 'string', format: 'uuid' },
                        createdAt: { type: 'string', format: 'date-time' },
                      },
                    },
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
      tags: ['Module Dependencies'],
      summary: 'Create module dependency',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateModuleDependencyBody' },
          },
        },
      },
      responses: {
        201: {
          description: 'Module dependency created',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example: 'Module dependency created',
                  },
                  data: { type: 'object' },
                },
              },
            },
          },
        },
        ...errors,
      },
    },
  },
  '/api/superAdmin/module-dependencies/{id}': {
    delete: {
      tags: ['Module Dependencies'],
      summary: 'Delete module dependency',
      security: [{ bearerAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', required: true, schema: { type: 'string' } },
      ],
      responses: {
        200: {
          description: 'Module dependency deleted',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example: 'Module dependency deleted',
                  },
                },
              },
            },
          },
        },
        ...errors,
      },
    },
  },
};
