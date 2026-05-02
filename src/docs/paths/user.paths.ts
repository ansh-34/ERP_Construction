import { ok, created, errors } from './responses.js';

export const UserPaths = {
  '/api/users/verify': {
    post: {
      tags: ['Users'],
      summary: 'Verify and activate invited user',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/VerifyUserBody' },
          },
        },
      },
      responses: { ...ok, ...errors },
    },
  },

  '/api/users/register': {
    post: {
      tags: ['Users'],
      summary: 'Register user',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/RegisterUserBody' },
          },
        },
      },
      responses: { ...created, ...errors },
    },
  },

  '/api/users/login': {
    post: {
      tags: ['Users'],
      summary: 'User login',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/DomainLoginBody' },
          },
        },
      },
      responses: { ...ok, ...errors },
    },
  },

  '/api/users/invite': {
    post: {
      tags: ['Users'],
      summary: 'Invite user (admin)',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/InviteUserBody' },
          },
        },
      },
      responses: { ...ok, ...errors },
    },
  },

  '/api/users': {
    get: {
      tags: ['Users'],
      summary: 'List users',
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
