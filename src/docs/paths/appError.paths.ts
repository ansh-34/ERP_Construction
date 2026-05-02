import { ok, created, errors } from './responses.js';

export const AppErrorPaths = {
  '/api/app-errors': {
    post: {
      tags: ['App Errors'],
      summary: 'Create app error entry',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateAppErrorBody' },
          },
        },
      },
      responses: { ...created, ...errors },
    },
    get: {
      tags: ['App Errors'],
      summary: 'List app errors',
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
        { in: 'query', name: 'from', schema: { type: 'string' } },
        { in: 'query', name: 'to', schema: { type: 'string' } },
      ],
      responses: { ...ok, ...errors },
    },
  },
};
