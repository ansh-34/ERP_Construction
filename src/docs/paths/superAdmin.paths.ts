import { ok, created, errors } from './responses.js';

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
      responses: { ...ok, ...errors },
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
      responses: { ...created, ...errors },
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
      responses: { ...ok, ...errors },
    },
  },
};
