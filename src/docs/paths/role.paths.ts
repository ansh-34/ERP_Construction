import { errors } from './responses.js';

export const RolePaths = {
  '/api/domain/roles': {
    get: {
      tags: ['Roles'],
      summary: 'List roles',
      security: [{ bearerAuth: [] }],
      parameters: [
        { in: 'query', name: 'offset', schema: { type: 'integer', minimum: 0 } },
        { in: 'query', name: 'limit', schema: { type: 'integer', minimum: 1, maximum: 100 } },
      ],
      responses: {
        200: {
          description: 'Roles retrieved',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Roles retrieved' },
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
                        name: { type: 'string', example: 'Manager' },
                        code: { type: 'string', example: 'manager' },
                        level: { type: 'number', example: 2 },
                        domainId: { type: 'string', format: 'uuid' },
                        status: { type: 'string', example: 'active' },
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
      tags: ['Roles'],
      summary: 'Create role',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateRoleBody' },
          },
        },
      },
      responses: {
        201: {
          description: 'Role created',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Role created' },
                  data: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', format: 'uuid' },
                      name: { type: 'string' },
                      code: { type: 'string' },
                      level: { type: 'number' },
                      domainId: { type: 'string', format: 'uuid' },
                      status: { type: 'string', example: 'active' },
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

  '/api/domain/roles/{roleId}/permissions': {
    post: {
      tags: ['Roles'],
      summary: 'Assign permissions to role for module',
      security: [{ bearerAuth: [] }],
      parameters: [
        { in: 'path', name: 'roleId', required: true, schema: { type: 'string' } },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/AssignPermissionsBody' },
          },
        },
      },
      responses: {
        200: {
          description: 'Permissions assigned to role',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Permissions assigned' },
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

  '/api/domain/roles/{id}/role': {
    post: {
      tags: ['Roles'],
      summary: 'Assign role to user',
      security: [{ bearerAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', required: true, schema: { type: 'string' } },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/AssignRoleBody' },
          },
        },
      },
      responses: {
        200: {
          description: 'Role assigned to user',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Role assigned' },
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
};
