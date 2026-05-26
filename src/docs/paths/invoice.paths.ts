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
  description: 'Invoices retrieved',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: {
            type: 'string',
            example: 'Invoices retrieved successfully',
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
            items: { $ref: '#/components/schemas/InvoiceObject' },
          },
        },
      },
    },
  },
};

const buildInvoicePaths = (basePath: string, tags: string[]) => ({
  [`${basePath}`]: {
    get: {
      tags,
      summary: 'List invoices',
      description: 'Get a paginated list of invoices with filters.',
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
          name: 'searchKey',
          schema: { type: 'string' },
        },
        {
          in: 'query',
          name: 'vendorName',
          schema: { type: 'string' },
        },
        {
          in: 'query',
          name: 'purchaseOrderId',
          schema: { type: 'string', format: 'uuid' },
        },
        {
          in: 'query',
          name: 'projectId',
          schema: { type: 'string', format: 'uuid' },
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
      summary: 'Get invoice by ID',
      description: 'Fetch details of a single invoice.',
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
          description: 'Invoice retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: { $ref: '#/components/schemas/InvoiceObject' },
                },
              },
            },
          },
        },
        ...errors,
      },
    },
    delete: {
      tags,
      summary: 'Delete invoice',
      description: 'Soft-delete an invoice.',
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
          description: 'Invoice deleted successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example: 'Invoice deleted successfully',
                  },
                  data: { type: 'object', nullable: true, example: null },
                },
              },
            },
          },
        },
        ...errors,
      },
    },
  },
  [`${basePath}/{id}/items`]: {
    get: {
      tags,
      summary: 'List invoice items',
      description: 'Get all line items of an invoice.',
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
          description: 'Invoice items retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/InvoiceItemObject' },
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
  [`${basePath}/po/{poId}`]: {
    post: {
      tags,
      summary: 'Generate invoices from Purchase Order',
      description:
        'Generate invoices for a purchase order by assigning vendors from pricing rules.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'poId',
          required: true,
          schema: { type: 'string', format: 'uuid' },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/GenerateInvoicesFromPOBody' },
          },
        },
      },
      responses: {
        201: {
          description: 'Invoices generated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example: 'Invoices generated successfully',
                  },
                  data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/InvoiceObject' },
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
});

export const InvoicePaths = {
  ...buildInvoicePaths('/api/domain/invoices', ['Invoices']),
  ...buildInvoicePaths('/api/user/invoices', ['User Invoices']),
};
