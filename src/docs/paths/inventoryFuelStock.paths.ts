import { errors } from './responses.js';

const fuelTypeEnum = ['PETROL', 'DIESEL'];
const statusEnum = ['ACTIVE', 'INACTIVE'];

const inventoryFuelStockObject = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    fuelType: { type: 'string', enum: fuelTypeEnum, example: 'DIESEL' },
    uomId: { type: 'string', format: 'uuid' },
    availableQuantity: { type: 'number', example: 160 },
    totalRefilledQuantity: { type: 'number', example: 200 },
    totalConsumedQuantity: { type: 'number', example: 40 },
    status: { type: 'string', enum: statusEnum, example: 'ACTIVE' },
    uom: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        code: { type: 'string', example: 'LTR' },
        displayName: { type: 'object', example: { en: 'Litre' } },
      },
    },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

const listQueryParams = [
  {
    in: 'query',
    name: 'offset',
    schema: { type: 'integer', minimum: 0 },
    description: 'Number of records to skip',
  },
  {
    in: 'query',
    name: 'limit',
    schema: { type: 'integer', minimum: 1, maximum: 100 },
    description: 'Page size',
  },
  {
    in: 'query',
    name: 'fuelType',
    schema: { type: 'string', enum: fuelTypeEnum },
  },
  {
    in: 'query',
    name: 'uomId',
    schema: { type: 'string', format: 'uuid' },
  },
  {
    in: 'query',
    name: 'status',
    schema: { type: 'string', enum: statusEnum },
  },
  { in: 'query', name: 'searchKey', schema: { type: 'string' } },
];

const idParam = {
  in: 'path',
  name: 'id',
  required: true,
  schema: { type: 'string', format: 'uuid' },
};

export const InventoryFuelStockPaths = {
  '/api/domain/inventory-fuel-stocks': {
    get: {
      tags: ['Inventory Fuel Stocks'],
      summary: 'List inventory fuel stocks',
      description:
        'Read-only domain fuel stock balances. Stock is created and updated only through fuel logs.',
      security: [{ bearerAuth: [] }],
      parameters: listQueryParams,
      responses: {
        200: {
          description: 'Inventory fuel stocks fetched successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example: 'Inventory fuel stocks fetched successfully',
                  },
                  pagination: {
                    type: 'object',
                    properties: {
                      totalCount: { type: 'integer', example: 1 },
                      currentCount: { type: 'integer', example: 1 },
                      offset: { type: 'integer', example: 0 },
                      limit: { type: 'integer', example: 10 },
                    },
                  },
                  data: {
                    type: 'array',
                    items: inventoryFuelStockObject,
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
  '/api/domain/inventory-fuel-stocks/{id}': {
    get: {
      tags: ['Inventory Fuel Stocks'],
      summary: 'Get inventory fuel stock by id',
      description:
        'Read-only domain fuel stock detail. Use fuel logs to refill or consume fuel.',
      security: [{ bearerAuth: [] }],
      parameters: [idParam],
      responses: {
        200: {
          description: 'Inventory fuel stock fetched successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example: 'Inventory fuel stock fetched successfully',
                  },
                  data: inventoryFuelStockObject,
                },
              },
            },
          },
        },
        ...errors,
      },
    },
  },
  '/api/user/inventory-fuel-stocks': {
    get: {
      tags: ['User Inventory Fuel Stocks'],
      summary: 'List user inventory fuel stocks',
      description:
        'Read-only domain fuel stock balances for the user module. Stock is created and updated only through fuel logs.',
      security: [{ bearerAuth: [] }],
      parameters: listQueryParams,
      responses: {
        200: {
          description: 'Inventory fuel stocks fetched successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example: 'Inventory fuel stocks fetched successfully',
                  },
                  pagination: {
                    type: 'object',
                    properties: {
                      totalCount: { type: 'integer', example: 1 },
                      currentCount: { type: 'integer', example: 1 },
                      offset: { type: 'integer', example: 0 },
                      limit: { type: 'integer', example: 10 },
                    },
                  },
                  data: {
                    type: 'array',
                    items: inventoryFuelStockObject,
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
  '/api/user/inventory-fuel-stocks/{id}': {
    get: {
      tags: ['User Inventory Fuel Stocks'],
      summary: 'Get user inventory fuel stock by id',
      description:
        'Read-only fuel stock detail for user module. Use fuel logs to refill or consume fuel.',
      security: [{ bearerAuth: [] }],
      parameters: [idParam],
      responses: {
        200: {
          description: 'Inventory fuel stock fetched successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example: 'Inventory fuel stock fetched successfully',
                  },
                  data: inventoryFuelStockObject,
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
