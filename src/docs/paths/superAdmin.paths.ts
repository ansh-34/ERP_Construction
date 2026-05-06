import { errors } from './responses.js';

export const SuperAdminPaths = {
  '/api/superAdmin/auth/login': {
    post: {
      tags: ['SuperAdmin'],
      summary: 'Login superAdmin',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/SuperAdminLoginBody' },
          },
        },
      },
      responses: {
        200: {
          description: 'SuperAdmin login successful',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SuperAdminLoginResponse' },
            },
          },
        },
        ...errors,
      },
    },
  },

  '/api/superAdmin/domain/seed': {
    post: {
      tags: ['SuperAdmin'],
      summary: 'Seed domain by superAdmin',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/SeedDomainBody' },
          },
        },
      },
      responses: {
        201: {
          description: 'Domain seeded',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SeedDomainResponse' },
            },
          },
        },
        ...errors,
      },
    },
  },

  '/api/superAdmin/domain/verify': {
    get: {
      tags: ['SuperAdmin'],
      summary: 'Verify seeded domain token',
      parameters: [
        {
          in: 'query',
          name: 'email',
          required: true,
          schema: { type: 'string' },
        },
        {
          in: 'query',
          name: 'token',
          required: true,
          schema: { type: 'string' },
        },
      ],
      responses: {
        200: {
          description: 'Domain verified',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example: 'Domain verified successfully',
                  },
                  data: {
                    type: 'object',
                    properties: {
                      domain: {
                        type: 'object',
                        properties: {
                          id: { type: 'string', format: 'uuid' },
                          name: {
                            type: 'object',
                            example: { en: 'My Company' },
                          },
                          email: { type: 'string', format: 'email' },
                          industry: { type: 'string', example: 'CONSTRUCTION' },
                        },
                      },
                    },
                  },
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
