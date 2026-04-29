import { ok, created, errors } from './responses.js';

export const DispatchPaths = {
  '/api/dispatch/entry': {
    post: {
      tags: ['Dispatch'],
      summary: 'Create dispatch',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateDispatchBody' },
          },
        },
      },
      responses: { ...created, ...errors },
    },
  },

  '/api/dispatch/list': {
    get: {
      tags: ['Dispatch'],
      summary: 'List dispatch entries',
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
