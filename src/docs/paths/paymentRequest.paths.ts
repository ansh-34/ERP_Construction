import { errors } from './responses.js';

const paginationParams = [
  {
    in: 'query' as const,
    name: 'offset',
    schema: { type: 'integer', minimum: 0, default: 0 },
    description: 'Records to skip',
  },
  {
    in: 'query' as const,
    name: 'limit',
    schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
    description: 'Max records',
  },
];

const listResponse = {
  description: 'Payment requests retrieved',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: {
            type: 'string',
            example: 'Payment request retrieved successfully',
          },
          pagination: {
            type: 'object',
            properties: {
              currentCount: { type: 'integer' },
              totalCount: { type: 'integer' },
              offset: { type: 'integer' },
              limit: { type: 'integer' },
            },
          },
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/PaymentRequestObject' },
          },
        },
      },
    },
  },
};

const singleResponse = (message: string) => ({
  description: message,
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: message },
          data: { $ref: '#/components/schemas/PaymentRequestObject' },
        },
      },
    },
  },
});

const deletedResponse = {
  description: 'Payment request deleted successfully',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: {
            type: 'string',
            example: 'Payment request deleted successfully',
          },
          data: { type: 'object', nullable: true, example: null },
        },
      },
    },
  },
};

const idParam = {
  in: 'path' as const,
  name: 'id',
  required: true,
  schema: { type: 'string', format: 'uuid' },
  description: 'Payment request ID',
};

const buildPaymentRequestPaths = (basePath: string, tags: string[]) => ({
  [`${basePath}`]: {
    post: {
      tags,
      summary: 'Create payment request',
      description: 'Create a new payment request.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/CreatePaymentRequestBody',
            },
          },
        },
      },
      responses: {
        201: singleResponse('Payment request created successfully'),
        ...errors,
      },
    },
    get: {
      tags,
      summary: 'List payment requests',
      description:
        'Get a paginated list of payment requests with optional filters.',
      security: [{ bearerAuth: [] }],
      parameters: [
        ...paginationParams,
        {
          in: 'query',
          name: 'status',
          schema: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
        },
        {
          in: 'query',
          name: 'paymentStatus',
          schema: {
            type: 'string',
            enum: ['PENDING', 'APPROVED', 'PAID'],
          },
        },
        {
          in: 'query',
          name: 'projectId',
          schema: { type: 'string', format: 'uuid' },
        },
        {
          in: 'query',
          name: 'vendorId',
          schema: { type: 'string', format: 'uuid' },
        },
        {
          in: 'query',
          name: 'searchKey',
          schema: { type: 'string' },
          description: 'Searches code, referenceNumber, and notes',
        },
      ],
      responses: {
        200: listResponse,
        ...errors,
      },
    },
  },
  [`${basePath}/{id}`]: {
    get: {
      tags,
      summary: 'Get payment request by ID',
      description: 'Fetch details of a single payment request.',
      security: [{ bearerAuth: [] }],
      parameters: [idParam],
      responses: {
        200: singleResponse('Payment request retrieved successfully'),
        ...errors,
      },
    },
    put: {
      tags,
      summary: 'Update payment request',
      description: 'Update an existing payment request.',
      security: [{ bearerAuth: [] }],
      parameters: [idParam],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/UpdatePaymentRequestBody',
            },
          },
        },
      },
      responses: {
        200: singleResponse('Payment request updated successfully'),
        ...errors,
      },
    },
    delete: {
      tags,
      summary: 'Delete payment request',
      description: 'Soft-delete a payment request.',
      security: [{ bearerAuth: [] }],
      parameters: [idParam],
      responses: {
        200: deletedResponse,
        ...errors,
      },
    },
  },
});

export const PaymentRequestPaths = {
  ...buildPaymentRequestPaths('/api/domain/payment-requests', [
    'Payment Requests',
  ]),
  ...buildPaymentRequestPaths('/api/user/payment-requests', [
    'User Payment Requests',
  ]),
};
