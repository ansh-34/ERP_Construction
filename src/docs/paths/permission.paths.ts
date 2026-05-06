import { errors } from './responses.js';

export const PermissionPaths = {
  '/api/superAdmin/permissions': {
    get: {
      tags: ['Permissions'],
      summary: 'List permissions',
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
          description: 'Permissions retrieved with pagination',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Permissions retrieved' },
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
                        name: { type: 'object' },
                        code: { type: 'string' },
                        status: { type: 'string' },
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
      tags: ['Permissions'],
      summary: 'Create permission',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreatePermissionBody' },
          },
        },
      },
      responses: {
        201: {
          description: 'Permission created',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Permission created' },
                  data: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', format: 'uuid' },
                      name: { type: 'object' },
                      code: { type: 'string' },
                      status: { type: 'string' },
                      createdAt: { type: 'string', format: 'date-time' },
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
  },
  '/api/superAdmin/permissions/{id}': {
    put: {
      tags: ['Permissions'],
      summary: 'Update permission',
      security: [{ bearerAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', required: true, schema: { type: 'string' } },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UpdatePermissionBody' },
          },
        },
      },
      responses: {
        200: {
          description: 'Permission updated',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Permission updated' },
                  data: { type: 'object' },
                },
              },
            },
          },
        },
        ...errors,
      },
    },
    delete: {
      tags: ['Permissions'],
      summary: 'Delete permission',
      security: [{ bearerAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', required: true, schema: { type: 'string' } },
      ],
      responses: {
        200: {
          description: 'Permission deleted',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Permission deleted' },
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
