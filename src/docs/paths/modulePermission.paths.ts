import { ok, created, errors } from './responses.js';

export const ModulePermissionPaths = {
  '/api/module-permissions/{id}': {
    delete: {
      tags: ['Module Permissions'],
      summary: 'Delete module permissions record',
      security: [{ bearerAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', required: true, schema: { type: 'string' } },
      ],
      responses: { ...ok, ...errors },
    },
  },
  '/api/module-permissions': {
    post: {
      tags: ['Module Permissions'],
      summary: 'Set module permissions',
      security: [{ bearerAuth: [] }],
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
    get: {
      tags: ['Module Permissions'],
      summary: 'List module permissions',
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
