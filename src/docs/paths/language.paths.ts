import { ok, created, errors } from './responses.js';

export const LanguagePaths = {
  '/api/language': {
    get: {
      tags: ['Language'],
      summary: 'List languages',
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
    post: {
      tags: ['Language'],
      summary: 'Create language',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateLanguageBody' },
          },
        },
      },
      responses: { ...created, ...errors },
    },
  },
};
