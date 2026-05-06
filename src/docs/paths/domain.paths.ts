import { ok, errors } from './responses.js';

export const DomainPaths = {
  '/api/domain/login': {
    post: {
      tags: ['Domain Auth'],
      summary: 'Login domain owner/domain',
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
};
