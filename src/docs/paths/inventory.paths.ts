import { ok, created, errors } from './responses.js';

export const InventoryPaths = {
  '/api/inventory/records/entry': {
    post: {
      tags: ['Inventory'],
      summary: 'Add inventory item',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/AddInventoryBody' },
          },
        },
      },
      responses: { ...created, ...errors },
    },
  },

  '/api/inventory/records/list': {
    get: {
      tags: ['Inventory'],
      summary: 'List inventory items',
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
