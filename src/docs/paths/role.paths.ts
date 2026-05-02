import { ok, created, errors } from './responses.js';

export const RolePaths = {
  '/api/roles/{roleId}/permissions': {
    post: {
      tags: ['Roles'],
      summary: 'Assign permissions to role for module',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'roleId',
          required: true,
          schema: { type: 'string' },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/AssignPermissionsBody' },
          },
        },
      },
      responses: { ...ok, ...errors },
    },
  },

  '/api/roles/{id}/role': {
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
      responses: { ...ok, ...errors },
    },
  },
  '/api/roles': {
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
      responses: { ...created, ...errors },
    },
    get: {
      tags: ['Roles'],
      summary: 'List roles',
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
      responses: { ...ok, ...errors },
    },
  },
};
