import { errors } from './responses.js';

export const LanguagePaths = {
  '/api/domain/language': {
    get: {
      tags: ['Language'],
      summary: 'List languages',
      security: [{ bearerAuth: [] }],
      parameters: [
        { in: 'query', name: 'offset', schema: { type: 'integer', minimum: 0 } },
        { in: 'query', name: 'limit', schema: { type: 'integer', minimum: 1, maximum: 100 } },
      ],
      responses: {
        200: {
          description: 'Languages retrieved',
          content: { 'application/json': { schema: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              message: { type: 'string', example: 'Languages retrieved' },
              pagination: { type: 'object', properties: { currentCount: { type: 'integer' }, totalCount: { type: 'integer' }, offset: { type: 'integer' }, limit: { type: 'integer' } } },
              data: { type: 'array', items: { type: 'object', properties: { id: { type: 'string', format: 'uuid' }, name: { type: 'object', example: { en: 'English' } }, code: { type: 'string', example: 'en' }, status: { type: 'string' }, createdAt: { type: 'string', format: 'date-time' } } } },
            },
          } } },
        },
        ...errors,
      },
    },
    post: {
      tags: ['Language'],
      summary: 'Create language',
      security: [{ bearerAuth: [] }],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateLanguageBody' } } } },
      responses: {
        201: {
          description: 'Language created',
          content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, message: { type: 'string', example: 'Language created' }, data: { type: 'object', properties: { id: { type: 'string', format: 'uuid' }, name: { type: 'object' }, code: { type: 'string' }, status: { type: 'string' }, createdAt: { type: 'string', format: 'date-time' } } } } } } },
        },
        ...errors,
      },
    },
  },
};
