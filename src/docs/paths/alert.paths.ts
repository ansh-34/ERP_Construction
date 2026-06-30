import { errors } from './responses.js';

const alertStatusEnum = ['ACTIVE', 'RESOLVED', 'DISMISSED'];
const alertSeverityEnum = ['INFO', 'WARNING', 'CRITICAL'];
const alertCodeExamples = [
  'MACHINE_FUEL_USAGE_VARIANCE',
  'MACHINE_RUNTIME_VARIANCE',
  'PURCHASE_PRICE_INCREASE',
];

const idParam = {
  in: 'path',
  name: 'id',
  required: true,
  schema: { type: 'string', format: 'uuid' },
};

const alertObject = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    moduleCode: { type: 'string', example: 'PO' },
    alertCode: {
      type: 'string',
      example: 'PURCHASE_PRICE_INCREASE',
    },
    entityType: { type: 'string', example: 'INVOICE_ITEM' },
    entityId: { type: 'string', format: 'uuid' },
    title: { type: 'string', example: 'Purchase Price Increased' },
    message: {
      type: 'string',
      example:
        'Bricks - Grade A purchase price increased from 50/LITERS to 65/LITERS (30% higher).',
    },
    severity: { type: 'string', enum: alertSeverityEnum, example: 'WARNING' },
    alertStatus: { type: 'string', enum: alertStatusEnum, example: 'ACTIVE' },
    metadata: { type: 'object', nullable: true },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

export const AlertPaths = {
  '/api/domain/alerts': {
    get: {
      tags: ['Alerts'],
      summary: 'List alerts',
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
        {
          in: 'query',
          name: 'moduleCode',
          schema: { type: 'string' },
          example: 'PO',
          description:
            'Use PO for purchase price alerts, MACHINERY for machinery variance alerts.',
        },
        {
          in: 'query',
          name: 'alertCode',
          schema: { type: 'string', enum: alertCodeExamples },
          example: 'PURCHASE_PRICE_INCREASE',
        },
        {
          in: 'query',
          name: 'alertStatus',
          schema: { type: 'string', enum: alertStatusEnum },
        },
        { in: 'query', name: 'entityType', schema: { type: 'string' } },
        {
          in: 'query',
          name: 'entityId',
          schema: { type: 'string', format: 'uuid' },
        },
        { in: 'query', name: 'searchKey', schema: { type: 'string' } },
      ],
      responses: {
        200: {
          description: 'Alerts fetched successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example: 'Alerts fetched successfully',
                  },
                  data: { type: 'array', items: alertObject },
                },
              },
            },
          },
        },
        ...errors,
      },
    },
  },
  '/api/domain/alerts/{id}': {
    get: {
      tags: ['Alerts'],
      summary: 'Get alert by id',
      security: [{ bearerAuth: [] }],
      parameters: [idParam],
      responses: {
        200: {
          description: 'Alert fetched successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example: 'Alert fetched successfully',
                  },
                  data: alertObject,
                },
              },
            },
          },
        },
        ...errors,
      },
    },
  },
  '/api/domain/alerts/{id}/status': {
    put: {
      tags: ['Alerts'],
      summary: 'Update alert status',
      security: [{ bearerAuth: [] }],
      parameters: [idParam],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['alertStatus'],
              properties: {
                alertStatus: {
                  type: 'string',
                  enum: alertStatusEnum,
                  example: 'RESOLVED',
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Alert status updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example: 'Alert status updated successfully',
                  },
                  data: alertObject,
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

Object.assign(AlertPaths, {
  '/api/user/alerts': {
    get: {
      ...AlertPaths['/api/domain/alerts'].get,
      tags: ['User Alerts'],
    },
  },
  '/api/user/alerts/{id}': {
    get: {
      ...AlertPaths['/api/domain/alerts/{id}'].get,
      tags: ['User Alerts'],
    },
  },
  '/api/user/alerts/{id}/status': {
    put: {
      ...AlertPaths['/api/domain/alerts/{id}/status'].put,
      tags: ['User Alerts'],
    },
  },
});
