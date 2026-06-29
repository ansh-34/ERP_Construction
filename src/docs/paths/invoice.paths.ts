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

const invoiceListParams = [
  ...paginationParams,
  {
    in: 'query' as const,
    name: 'status',
    schema: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
  },
  {
    in: 'query' as const,
    name: 'searchKey',
    schema: { type: 'string' },
  },
  {
    in: 'query' as const,
    name: 'vendorName',
    schema: { type: 'string' },
  },
  {
    in: 'query' as const,
    name: 'purchaseOrderId',
    schema: { type: 'string', format: 'uuid' },
  },
  {
    in: 'query' as const,
    name: 'projectId',
    schema: { type: 'string', format: 'uuid' },
  },
  {
    in: 'query' as const,
    name: 'invoiceType',
    description: 'Defaults to FINAL when omitted.',
    schema: { type: 'string', enum: ['PROFORMA', 'FINAL'] },
  },
  {
    in: 'query' as const,
    name: 'lifecycle',
    description: 'Defaults to ACTIVE when omitted.',
    schema: { type: 'string', enum: ['ACTIVE', 'VOID'] },
  },
];

const itemsListResponse = {
  description: 'Invoice items retrieved',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: {
            type: 'string',
            example: 'Invoice items retrieved successfully',
          },
          data: {
            type: 'object',
            properties: {
              items: {
                type: 'array',
                items: { $ref: '#/components/schemas/InvoiceItemObject' },
              },
              pagination: {
                type: 'object',
                properties: {
                  totalCount: { type: 'integer' },
                  currentCount: { type: 'integer' },
                  offset: { type: 'integer' },
                  limit: { type: 'integer' },
                },
              },
            },
          },
        },
      },
    },
  },
};

const buildInvoicePaths = (
  basePath: string,
  tags: string[],
  options: { includeAllItems?: boolean } = {},
) => ({
  [`${basePath}`]: {
    get: {
      tags,
      summary: 'List invoices',
      description: 'Get a paginated list of invoices with filters.',
      security: [{ bearerAuth: [] }],
      parameters: invoiceListParams,
      responses: {
        200: listResponse,
        ...errors,
      },
    },
  },
  [`${basePath}/active`]: {
    get: {
      tags,
      summary: 'List active invoices',
      description:
        'Get a paginated list of invoices restricted to the ACTIVE lifecycle.',
      security: [{ bearerAuth: [] }],
      parameters: invoiceListParams,
      responses: {
        200: listResponse,
        ...errors,
      },
    },
  },
  [`${basePath}/active/{id}`]: {
    get: {
      tags,
      summary: 'Get active invoice by ID',
      description: 'Fetch a single invoice restricted to the ACTIVE lifecycle.',
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
  },
  ...(options.includeAllItems
    ? {
        [`${basePath}/items`]: {
          get: {
            tags,
            summary: 'List all invoice items',
            description:
              'Get a paginated list of invoice line items across invoices, optionally filtered by invoice.',
            security: [{ bearerAuth: [] }],
            parameters: [
              ...paginationParams,
              {
                in: 'query',
                name: 'invoiceId',
                schema: { type: 'string', format: 'uuid' },
              },
              {
                in: 'query',
                name: 'searchKey',
                schema: { type: 'string' },
              },
            ],
            responses: {
              200: itemsListResponse,
              ...errors,
            },
          },
        },
      }
    : {}),
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
        {
          in: 'query',
          name: 'invoiceType',
          description: 'Defaults to FINAL when omitted.',
          schema: { type: 'string', enum: ['PROFORMA', 'FINAL'] },
        },
        {
          in: 'query',
          name: 'lifecycle',
          description: 'Defaults to ACTIVE when omitted.',
          schema: { type: 'string', enum: ['ACTIVE', 'VOID'] },
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
  [`${basePath}/{id}/export`]: {
    get: {
      tags,
      summary: 'Export invoice by ID',
      description:
        'Export a single invoice and its line items. Currently only Excel export is supported.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string', format: 'uuid' },
        },
        {
          in: 'query',
          name: 'exportType',
          required: true,
          schema: { type: 'string', enum: ['EXCEL'] },
          example: 'EXCEL',
        },
      ],
      responses: {
        200: {
          description: 'Excel file containing invoice details and item rows',
          content: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
              {
                schema: {
                  type: 'string',
                  format: 'binary',
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
  [`${basePath}/{id}/finalize`]: {
    post: {
      tags,
      summary: 'Finalize a proforma invoice',
      description:
        'Convert a PROFORMA invoice into a FINAL invoice. The final invoice is rebuilt entirely from the supplied items (full replacement).',
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
            schema: { $ref: '#/components/schemas/FinalizeInvoiceBody' },
          },
        },
      },
      responses: {
        201: {
          description: 'Invoice finalized successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example: 'Invoice finalized successfully',
                  },
                  data: { $ref: '#/components/schemas/InvoiceObject' },
                },
              },
            },
          },
        },
        ...errors,
      },
    },
  },
  [`${basePath}/{id}/pdf`]: {
    post: {
      tags,
      summary: 'Request invoice PDF generation',
      description:
        'Queue asynchronous PDF generation for an invoice. Returns immediately with the current pdfStatus; poll GET /{id}/pdf for the result.',
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
        202: {
          description: 'PDF generation queued',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example: 'Invoice PDF generation queued',
                  },
                  data: {
                    type: 'object',
                    properties: {
                      pdfStatus: {
                        type: 'string',
                        enum: ['PENDING', 'PROCESSING', 'READY', 'FAILED'],
                        example: 'PENDING',
                      },
                    },
                  },
                },
              },
            },
          },
        },
        ...errors,
      },
    },
    get: {
      tags,
      summary: 'Get invoice PDF status',
      description:
        'Get the current PDF generation status. When READY, a signed, time-limited downloadUrl is returned.',
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
          description: 'Invoice PDF status retrieved',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example: 'Invoice PDF status retrieved',
                  },
                  data: {
                    $ref: '#/components/schemas/InvoicePdfStatusObject',
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
  ...buildInvoicePaths('/api/user/invoices', ['User Invoices'], {
    includeAllItems: true,
  }),
};
