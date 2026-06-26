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
  description: 'GRNs retrieved',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'GRNs retrieved successfully' },
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
            items: { $ref: '#/components/schemas/GrnObject' },
          },
        },
      },
    },
  },
};

const buildGrnPaths = (basePath: string, tags: string[]) => ({
  [`${basePath}`]: {
    post: {
      tags,
      summary: 'Create GRN',
      description:
        'Create a new Goods Receipt Note. If productOrderCode is provided, it validates against an APPROVED Purchase Order.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateGrnBody' },
          },
        },
      },
      responses: {
        201: {
          description: 'GRN created successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example: 'GRN created successfully',
                  },
                  data: { $ref: '#/components/schemas/GrnObject' },
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
      summary: 'List GRNs',
      description: 'Get a paginated list of Goods Receipt Notes.',
      security: [{ bearerAuth: [] }],
      parameters: [
        ...paginationParams,
        {
          in: 'query',
          name: 'approvalStatus',
          schema: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED'] },
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
      summary: 'Get GRN by ID',
      description: 'Fetch details of a single GRN including its line items.',
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
          description: 'GRN retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: { $ref: '#/components/schemas/GrnObject' },
                },
              },
            },
          },
        },
        ...errors,
      },
    },
    put: {
      tags,
      summary: 'Update GRN and associated Products',
      description:
        'Update the general details (such as waybill reference) and sync/update the product line items of a PENDING or REJECTED GRN. Within the grnProducts array, product items can be passed with an id (updates existing line item) or without an id (creates a new line item).',
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
            schema: { $ref: '#/components/schemas/UpdateGrnBody' },
          },
        },
      },
      responses: {
        200: {
          description: 'GRN updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: { $ref: '#/components/schemas/GrnObject' },
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
      summary: 'Delete GRN',
      description: 'Soft-delete a GRN. Cannot delete an APPROVED GRN.',
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
          description: 'GRN deleted successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: { type: 'null' },
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
      summary: 'Export GRN by ID',
      description:
        'Export a single GRN and its product line items. Currently only Excel export is supported.',
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
          description: 'Excel file containing GRN details and product rows',
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
  [`${basePath}/{id}/approval`]: {
    put: {
      tags,
      summary: 'Approve or Reject GRN',
      description:
        'Change the approval status of a GRN. Approving will trigger inventory updates downstream.',
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
            schema: { $ref: '#/components/schemas/ApproveRejectGrnBody' },
          },
        },
      },
      responses: {
        200: {
          description: 'GRN approval status updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: { $ref: '#/components/schemas/GrnObject' },
                },
              },
            },
          },
        },
        ...errors,
      },
    },
  },
  [`${basePath}/{id}/products`]: {
    get: {
      tags,
      summary: 'List GRN Products',
      description: 'List all active product line items for a GRN.',
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
          description: 'Product line items retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/GrnProductObject' },
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
  [`${basePath}/{id}/products/{productId}`]: {
    put: {
      tags,
      summary: 'Update GRN Product Line Item',
      description:
        'Update the quantity, rate, tax, or material name of a specific product line item. The parent GRN totals will automatically recalculate.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string', format: 'uuid' },
        },
        {
          in: 'path',
          name: 'productId',
          required: true,
          schema: { type: 'string', format: 'uuid' },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UpdateGrnProductBody' },
          },
        },
      },
      responses: {
        200: {
          description: 'Product line item updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example: 'Product line item updated successfully',
                  },
                  data: { $ref: '#/components/schemas/GrnProductObject' },
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
      summary: 'Delete GRN Product Line Item',
      description: 'Soft-delete a specific product line item from the GRN.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string', format: 'uuid' },
        },
        {
          in: 'path',
          name: 'productId',
          required: true,
          schema: { type: 'string', format: 'uuid' },
        },
      ],
      responses: {
        200: {
          description: 'Product line item deleted successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example: 'Product line item deleted successfully',
                  },
                  data: { type: 'null' },
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

export const GrnPaths = {
  ...buildGrnPaths('/api/domain/grn', ['Domain GRNs']),
  ...buildGrnPaths('/api/user/grn', ['User GRNs']),
};
