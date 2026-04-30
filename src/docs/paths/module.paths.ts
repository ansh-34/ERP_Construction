import { ok, created, errors } from './responses.js';

export const ModulePaths = {
  '/api/modules/entry': {
    post: {
      tags: ['Modules'],
      summary: 'Create module',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateModuleBody' },
          },
        },
      },
      responses: { ...created, ...errors },
    },
  },

  '/api/modules/list': {
    get: {
      tags: ['Modules'],
      summary: 'List modules',
      security: [{ bearerAuth: [] }],
      responses: { ...ok, ...errors },
    },
  },

  '/api/modules/{id}': {
    post: {
      tags: ['Modules'],
      summary: 'Update module',
      security: [{ bearerAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', required: true, schema: { type: 'string' } },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UpdateModuleBody' },
          },
        },
      },
      responses: { ...ok, ...errors },
    },
    delete: {
      tags: ['Modules'],
      summary: 'Delete module',
      security: [{ bearerAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', required: true, schema: { type: 'string' } },
      ],
      responses: { ...ok, ...errors },
    },
  },
};
