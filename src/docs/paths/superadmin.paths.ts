import { ok, created, errors } from './responses.js';

export const SuperadminPaths = {
  '/api/superadmin/auth/login': {
    post: {
      tags: ['Superadmin'],
      summary: 'Login superadmin',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/SuperadminLoginBody' },
          },
        },
      },
      responses: { ...ok, ...errors },
    },
  },

  '/api/superadmin/domain/seed': {
    post: {
      tags: ['Superadmin'],
      summary: 'Seed domain by superadmin',
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

  '/api/superadmin/domain/verify': {
    get: {
      tags: ['Superadmin'],
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
