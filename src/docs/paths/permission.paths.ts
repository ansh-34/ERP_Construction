import { ok, created, errors } from './responses.js';

export const PermissionPaths = {
  '/api/permissions/entry': {
    post: {
      tags: ['Permissions'],
      summary: 'Create permission',
      security: [{ cookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreatePermissionBody' },
          },
        },
      },
      responses: { ...created, ...errors },
    },
  },

  '/api/permissions/list': {
    get: {
      tags: ['Permissions'],
      summary: 'List permissions',
      security: [{ cookieAuth: [] }],
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
      responses: { ...ok, ...errors },
    },
  },

  '/api/permissions/{id}': {
    put: {
      tags: ['Permissions'],
      summary: 'Update permission',
      security: [{ cookieAuth: [] }],
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
      responses: { ...ok, ...errors },
    },
    delete: {
      tags: ['Permissions'],
      summary: 'Delete permission',
      security: [{ cookieAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', required: true, schema: { type: 'string' } },
      ],
      responses: { ...ok, ...errors },
    },
  },
};
