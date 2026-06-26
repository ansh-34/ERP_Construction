import { errors } from './responses.js';

const statusEnum = ['ACTIVE', 'INACTIVE'];
const transactionTypeEnum = ['INWARD', 'OUTWARD'];

const idParam = {
  in: 'path',
  name: 'id',
  required: true,
  schema: { type: 'string', format: 'uuid' },
};

const paginationParams = [
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
];

const machineryInventoryObject = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    name: { type: 'string', example: 'Hydraulic Filter' },
    machineId: { type: 'string', format: 'uuid' },
    quantity: { type: 'number', example: 12 },
    restockLevel: { type: 'number', example: 5 },
    uomId: { type: 'string', format: 'uuid' },
    status: { type: 'string', enum: statusEnum, example: 'ACTIVE' },
    machine: { type: 'object' },
    uom: { type: 'object' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

const machineryInventoryLogObject = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    date: { type: 'string', format: 'date-time' },
    transactionType: {
      type: 'string',
      enum: transactionTypeEnum,
      example: 'INWARD',
    },
    name: { type: 'string', example: 'Hydraulic Filter' },
    notes: { type: 'string', nullable: true },
    quantity: { type: 'number', example: 10 },
    machineryInventoryId: { type: 'string', format: 'uuid' },
    machineId: { type: 'string', format: 'uuid' },
    uomId: { type: 'string', format: 'uuid' },
    status: { type: 'string', enum: statusEnum, example: 'ACTIVE' },
    machineryInventory: { type: 'object' },
    machine: { type: 'object' },
    uom: { type: 'object' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

const createLogBody = {
  type: 'object',
  required: [
    'date',
    'transactionType',
    'name',
    'quantity',
    'machineId',
    'uomId',
  ],
  properties: {
    date: { type: 'string', format: 'date-time' },
    transactionType: {
      type: 'string',
      enum: transactionTypeEnum,
      example: 'INWARD',
    },
    name: { type: 'string', example: 'Hydraulic Filter' },
    notes: { type: 'string', nullable: true },
    quantity: { type: 'number', example: 10 },
    restockLevel: { type: 'number', example: 5 },
    machineryInventoryId: { type: 'string', format: 'uuid' },
    machineId: { type: 'string', format: 'uuid' },
    uomId: { type: 'string', format: 'uuid' },
    status: { type: 'string', enum: statusEnum, example: 'ACTIVE' },
  },
};

export const MachineryInventoryPaths = {
  '/api/domain/machinery-inventory': {
    get: {
      tags: ['Machinery Inventory'],
      summary: 'List machinery spare-part inventory',
      description:
        'Read-only spare-part stock balances. Create, update, or delete machinery inventory logs to change stock.',
      security: [{ bearerAuth: [] }],
      parameters: [
        ...paginationParams,
        {
          in: 'query',
          name: 'machineId',
          schema: { type: 'string', format: 'uuid' },
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
      ],
      responses: {
        200: {
          description: 'Machinery inventory fetched successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string' },
                  pagination: { type: 'object' },
                  data: { type: 'array', items: machineryInventoryObject },
                },
              },
            },
          },
        },
        ...errors,
      },
    },
  },
  '/api/domain/machinery-inventory/{id}': {
    get: {
      tags: ['Machinery Inventory'],
      summary: 'Get machinery spare-part inventory by id',
      security: [{ bearerAuth: [] }],
      parameters: [idParam],
      responses: {
        200: {
          description: 'Machinery inventory fetched successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string' },
                  data: machineryInventoryObject,
                },
              },
            },
          },
        },
        ...errors,
      },
    },
  },
  '/api/domain/machinery-inventory-logs': {
    post: {
      tags: ['Machinery Inventory Logs'],
      summary: 'Create machinery spare-part inventory log',
      description:
        'INWARD adds stock. OUTWARD subtracts stock. First INWARD can create the inventory row because machinery inventory has no direct create API.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: createLogBody } },
      },
      responses: {
        201: {
          description: 'Machinery inventory log created successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string' },
                  data: machineryInventoryLogObject,
                },
              },
            },
          },
        },
        ...errors,
      },
    },
    get: {
      tags: ['Machinery Inventory Logs'],
      summary: 'List machinery spare-part inventory logs',
      security: [{ bearerAuth: [] }],
      parameters: [
        ...paginationParams,
        {
          in: 'query',
          name: 'machineryInventoryId',
          schema: { type: 'string', format: 'uuid' },
        },
        {
          in: 'query',
          name: 'machineId',
          schema: { type: 'string', format: 'uuid' },
        },
        {
          in: 'query',
          name: 'uomId',
          schema: { type: 'string', format: 'uuid' },
        },
        {
          in: 'query',
          name: 'transactionType',
          schema: { type: 'string', enum: transactionTypeEnum },
        },
        {
          in: 'query',
          name: 'status',
          schema: { type: 'string', enum: statusEnum },
        },
        { in: 'query', name: 'searchKey', schema: { type: 'string' } },
        {
          in: 'query',
          name: 'fromDate',
          schema: { type: 'string', format: 'date-time' },
        },
        {
          in: 'query',
          name: 'toDate',
          schema: { type: 'string', format: 'date-time' },
        },
      ],
      responses: {
        200: {
          description: 'Machinery inventory logs fetched successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string' },
                  pagination: { type: 'object' },
                  data: { type: 'array', items: machineryInventoryLogObject },
                },
              },
            },
          },
        },
        ...errors,
      },
    },
  },
  '/api/domain/machinery-inventory-logs/{id}': {
    get: {
      tags: ['Machinery Inventory Logs'],
      summary: 'Get machinery inventory log by id',
      security: [{ bearerAuth: [] }],
      parameters: [idParam],
      responses: {
        200: {
          description: 'Machinery inventory log fetched successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string' },
                  data: machineryInventoryLogObject,
                },
              },
            },
          },
        },
        ...errors,
      },
    },
    put: {
      tags: ['Machinery Inventory Logs'],
      summary: 'Update machinery inventory log',
      description:
        'Reverses the old log stock movement and applies the new movement.',
      security: [{ bearerAuth: [] }],
      parameters: [idParam],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: createLogBody } },
      },
      responses: {
        200: {
          description: 'Machinery inventory log updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string' },
                  data: machineryInventoryLogObject,
                },
              },
            },
          },
        },
        ...errors,
      },
    },
    delete: {
      tags: ['Machinery Inventory Logs'],
      summary: 'Delete machinery inventory log',
      description:
        'Soft deletes the log and reverses its stock movement from the inventory row.',
      security: [{ bearerAuth: [] }],
      parameters: [idParam],
      responses: {
        200: {
          description: 'Machinery inventory log deleted successfully',
        },
        ...errors,
      },
    },
  },
};
