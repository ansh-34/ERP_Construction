import { errors } from './responses.js';

export const UomPaths = {
  '/api/domain/uoms': {
    get: {
      tags: ['UOMs'],
      summary: 'List UOMs',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'query',
          name: 'page',
          schema: { type: 'integer', minimum: 1, default: 1 },
        },
        {
          in: 'query',
          name: 'limit',
          schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
        },
      ],
      responses: {
        200: {
          description: 'UOMs retrieved',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UomListResponse' },
            },
          },
        },
        ...errors,
      },
    },
    post: {
      tags: ['UOMs'],
      summary: 'Create UOM',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateUomBody' },
          },
        },
      },
      responses: {
        201: {
          description: 'UOM created',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'UOM created' },
                  data: { $ref: '#/components/schemas/UomObject' },
                },
              },
            },
          },
        },
        ...errors,
      },
    },
  },
  '/api/domain/uoms/{id}': {
    get: {
      tags: ['UOMs'],
      summary: 'Get UOM by ID',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string', format: 'uuid' },
        },
      ],
      responses: {
        200: {
          description: 'UOM retrieved',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'UOM retrieved' },
                  data: { $ref: '#/components/schemas/UomObject' },
                },
              },
            },
          },
        },
        ...errors,
      },
    },
    put: {
      tags: ['UOMs'],
      summary: 'Update UOM',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string', format: 'uuid' },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UpdateUomBody' },
          },
        },
      },
      responses: {
        200: {
          description: 'UOM updated',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'UOM updated' },
                  data: { $ref: '#/components/schemas/UomObject' },
                },
              },
            },
          },
        },
        ...errors,
      },
    },
    delete: {
      tags: ['UOMs'],
      summary: 'Delete UOM',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string', format: 'uuid' },
        },
      ],
      responses: {
        200: {
          description: 'UOM deleted',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'UOM deleted' },
                },
              },
            },
          },
        },
        ...errors,
      },
    },
  },
};
