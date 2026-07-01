import { errors } from './responses.js';

const buildInventoryPaths = (basePath: string, tags: string[]) => ({
  [`${basePath}/stats`]: {
    get: {
      tags,
      summary: 'Inventory stats',
      description:
        'Returns total items, active/inactive counts, total quantity, low stock count, out of stock count, and unique product count.',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Inventory stats retrieved',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/InventoryStatsResponse' },
            },
          },
        },
        ...errors,
      },
    },
  },
  [`${basePath}`]: {
    get: {
      tags,
      summary: 'List inventory items',
      description:
        'Returns paginated list. Each entry includes enriched product (with productType and _count), product grade (with last purchase rates), and UOM (with conversionRate).',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'query',
          name: 'offset',
          schema: { type: 'integer', minimum: 0, default: 0 },
        },
        {
          in: 'query',
          name: 'limit',
          schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
        },
        {
          in: 'query',
          name: 'status',
          schema: { type: 'string' },
          description: 'Filter by status (e.g. active, inactive)',
        },
      ],
      responses: {
        200: {
          description: 'Inventory retrieved',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/InventoryListResponse' },
            },
          },
        },
        ...errors,
      },
    },
    post: {
      tags,
      summary: 'Create inventory entry',
      description:
        'Creates a new inventory record. Response includes enriched product, product grade (with last purchase rates), and UOM (with conversion rate).',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/AddInventoryBody' },
          },
        },
      },
      responses: {
        201: {
          description: 'Inventory entry created',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example: 'Inventory entry created',
                  },
                  data: { $ref: '#/components/schemas/InventoryEntryResponse' },
                },
              },
            },
          },
        },
        ...errors,
      },
    },
  },
  [`${basePath}/{id}/reorder`]: {
    put: {
      tags,
      summary: 'Update reorder level',
      description: 'Updates the reorder level for an inventory entry.',
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
            schema: { $ref: '#/components/schemas/UpdateReorderLevelBody' },
          },
        },
      },
      responses: {
        200: {
          description: 'Reorder level updated',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Reorder level updated' },
                  data: { $ref: '#/components/schemas/InventoryEntryResponse' },
                },
              },
            },
          },
        },
        ...errors,
      },
    },
  },
  [`${basePath}/{id}`]: {
    delete: {
      tags,
      summary: 'Delete inventory entry',
      description: 'Soft deletes an inventory entry.',
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
          description: 'Inventory entry deleted successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example: 'Inventory entry deleted successfully',
                  },
                  data: { type: 'object', nullable: true, default: null },
                },
              },
            },
          },
        },
        ...errors,
      },
    },
  },
});

export const InventoryPaths = {
  ...buildInventoryPaths('/api/domain/inventory', ['Inventory']),
  ...buildInventoryPaths('/api/user/inventory', ['User Inventory']),
};
