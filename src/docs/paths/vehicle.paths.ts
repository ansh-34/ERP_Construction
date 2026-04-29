import { ok, created, errors } from './responses.js';

export const VehiclePaths = {
  '/api/vehicles/entry': {
    post: {
      tags: ['Vehicles'],
      summary: 'Create vehicle',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateVehicleBody' },
          },
        },
      },
      responses: { ...created, ...errors },
    },
  },

  '/api/vehicles/list': {
    get: {
      tags: ['Vehicles'],
      summary: 'List vehicles',
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
