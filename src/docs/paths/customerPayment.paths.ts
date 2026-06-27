import { errors } from './responses.js';

const idParam = {
  in: 'path',
  name: 'id',
  required: true,
  schema: { type: 'string', format: 'uuid' },
};

const paginationParams = [
  { in: 'query', name: 'offset', schema: { type: 'integer', minimum: 0 } },
  {
    in: 'query',
    name: 'limit',
    schema: { type: 'integer', minimum: 1, maximum: 100 },
  },
  {
    in: 'query',
    name: 'customerId',
    schema: { type: 'string', format: 'uuid' },
  },
  {
    in: 'query',
    name: 'paymentType',
    schema: { type: 'string', enum: ['CASH'] },
  },
  {
    in: 'query',
    name: 'status',
    schema: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
  },
  { in: 'query', name: 'searchKey', schema: { type: 'string' } },
  { in: 'query', name: 'fromDate', schema: { type: 'string', format: 'date' } },
  { in: 'query', name: 'toDate', schema: { type: 'string', format: 'date' } },
];

const customerPaymentBody = {
  type: 'object',
  required: ['customerId', 'paidDate', 'amount'],
  properties: {
    customerId: { type: 'string', format: 'uuid' },
    paidDate: { type: 'string', format: 'date', example: '2026-06-26' },
    amount: { type: 'number', example: 5000 },
    roundOffAmount: { type: 'number', example: 0 },
    paymentType: { type: 'string', enum: ['CASH'], example: 'CASH' },
    cashLedgerId: { type: 'string', format: 'uuid', nullable: true },
    remarks: { type: 'string', example: 'Cash received' },
    status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'], example: 'ACTIVE' },
  },
};

const customerPaymentObject = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    customerId: { type: 'string', format: 'uuid' },
    paidDate: { type: 'string', format: 'date' },
    amount: { type: 'number' },
    outstandingAmount: { type: 'number' },
    roundOffAmount: { type: 'number' },
    paymentType: { type: 'string', enum: ['CASH'] },
    cashLedgerId: { type: 'string', format: 'uuid', nullable: true },
    remarks: { type: 'string', nullable: true },
    createdBy: { type: 'string', format: 'uuid', nullable: true },
    status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
    isDeleted: { type: 'boolean' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

const singleResponse = (message: string) => ({
  description: message,
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: customerPaymentObject,
        },
      },
    },
  },
});

export const CustomerPaymentPaths = {
  '/api/domain/customer-payments': {
    post: {
      tags: ['Customer Payments'],
      summary: 'Create customer payment',
      description:
        'Create a customer payment. outstandingAmount is calculated by backend.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: customerPaymentBody } },
      },
      responses: {
        201: singleResponse('Customer payment created successfully'),
        ...errors,
      },
    },
    get: {
      tags: ['Customer Payments'],
      summary: 'List customer payments',
      security: [{ bearerAuth: [] }],
      parameters: paginationParams,
      responses: {
        200: {
          description: 'Customer payments retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                  pagination: { type: 'object' },
                  data: { type: 'array', items: customerPaymentObject },
                },
              },
            },
          },
        },
        ...errors,
      },
    },
  },
  '/api/domain/customer-payments/{id}': {
    get: {
      tags: ['Customer Payments'],
      summary: 'Get customer payment by id',
      security: [{ bearerAuth: [] }],
      parameters: [idParam],
      responses: {
        200: singleResponse('Customer payment retrieved successfully'),
        ...errors,
      },
    },
    put: {
      tags: ['Customer Payments'],
      summary: 'Update customer payment',
      security: [{ bearerAuth: [] }],
      parameters: [idParam],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: customerPaymentBody } },
      },
      responses: {
        200: singleResponse('Customer payment updated successfully'),
        ...errors,
      },
    },
    delete: {
      tags: ['Customer Payments'],
      summary: 'Delete customer payment',
      security: [{ bearerAuth: [] }],
      parameters: [idParam],
      responses: {
        200: {
          description: 'Customer payment deleted successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                  data: { nullable: true },
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
