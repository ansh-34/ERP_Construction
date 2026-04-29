import { ok, created, errors } from './responses.js';

export const ModulePermissionPaths = {
  '/api/module-permissions/entry': {
    post: {
      tags: ['Module Permissions'],
      summary: 'Set module permissions',
      security: [{ cookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/SetModulePermissionsBody' },
          },
        },
      },
      responses: { ...ok, ...errors },
    },
  },

  '/api/module-permissions/list': {
    get: {
      tags: ['Module Permissions'],
      summary: 'List module permissions',
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

  '/api/module-permissions/{id}': {
    delete: {
      tags: ['Module Permissions'],
      summary: 'Delete module permissions record',
      security: [{ cookieAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', required: true, schema: { type: 'string' } },
      ],
      responses: { ...ok, ...errors },
    },
  },
};
