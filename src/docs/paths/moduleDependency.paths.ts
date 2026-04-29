import { ok, created, errors } from './responses.js';

export const ModuleDependencyPaths = {
  '/api/module-dependencies/entry': {
    post: {
      tags: ['Module Dependencies'],
      summary: 'Create module dependency',
      security: [{ cookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateModuleDependencyBody' },
          },
        },
      },
      responses: { ...created, ...errors },
    },
  },

  '/api/module-dependencies/list': {
    get: {
      tags: ['Module Dependencies'],
      summary: 'List module dependencies',
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

  '/api/module-dependencies/{id}': {
    delete: {
      tags: ['Module Dependencies'],
      summary: 'Delete module dependency',
      security: [{ cookieAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', required: true, schema: { type: 'string' } },
      ],
      responses: { ...ok, ...errors },
    },
  },
};
