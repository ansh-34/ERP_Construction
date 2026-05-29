import { errors } from './responses.js';

const buildVendorProductPricePaths = (basePath: string, tags: string[]) => ({
  [`${basePath}`]: {
    get: {
      tags,
      summary: 'List vendor product prices',
      description: 'Retrieve a paginated list of vendor product prices.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'query',
          name: 'page',
          schema: { type: 'integer', minimum: 1, default: 1 },
          description: 'Page number',
        },
        {
          in: 'query',
          name: 'limit',
          schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
          description: 'Records per page',
        },
        {
          in: 'query',
          name: 'status',
          schema: {
            type: 'string',
            enum: ['active', 'inactive', 'ACTIVE', 'INACTIVE'],
          },
          description: 'Filter by status',
        },
      ],
      responses: {
        200: {
          description: 'Vendor product prices retrieved',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example: 'Vendor product prices retrieved',
                  },
                  pagination: {
                    type: 'object',
                    properties: {
                      total: { type: 'integer', example: 5 },
                      page: { type: 'integer', example: 1 },
                      limit: { type: 'integer', example: 10 },
                    },
                  },
                  data: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/VendorProductPriceObject',
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
    post: {
      tags,
      summary: 'Create vendor product price',
      description: 'Create a new vendor product price mapping.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/CreateVendorProductPriceBody',
            },
          },
        },
      },
      responses: {
        201: {
          description: 'Vendor product price created successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example:
                      'Vendor product price mapping created successfully',
                  },
                  data: {
                    $ref: '#/components/schemas/VendorProductPriceObject',
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
  [`${basePath}/export`]: {
    get: {
      tags,
      summary: 'Export vendor product prices',
      description: 'Export all vendor product prices as a CSV file.',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'CSV file exported successfully',
          content: {
            'text/csv': {
              schema: { type: 'string' },
            },
          },
        },
        ...errors,
      },
    },
  },
  [`${basePath}/import`]: {
    post: {
      tags,
      summary: 'Import vendor product prices',
      description: 'Import vendor product prices from a CSV file.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              required: ['file'],
              properties: {
                file: {
                  type: 'string',
                  format: 'binary',
                  description: 'CSV file to import',
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Import completed successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example: 'Import completed successfully',
                  },
                  data: {
                    type: 'object',
                    properties: {
                      createdCount: { type: 'integer', example: 10 },
                      failedCount: { type: 'integer', example: 0 },
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
  },
  [`${basePath}/{id}`]: {
    get: {
      tags,
      summary: 'Get vendor product price by ID',
      description: 'Retrieve a single vendor product price mapping by ID.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description: 'Vendor product price ID',
        },
      ],
      responses: {
        200: {
          description: 'Vendor product price retrieved',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example: 'Vendor product price retrieved',
                  },
                  data: {
                    $ref: '#/components/schemas/VendorProductPriceObject',
                  },
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
      summary: 'Update vendor product price',
      description: 'Update field values of a vendor product price mapping.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description: 'Vendor product price ID',
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/UpdateVendorProductPriceBody',
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Vendor product price updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example: 'Vendor product price updated successfully',
                  },
                  data: {
                    $ref: '#/components/schemas/VendorProductPriceObject',
                  },
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
      summary: 'Delete vendor product price',
      description: 'Soft-delete a vendor product price mapping.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description: 'Vendor product price ID',
        },
      ],
      responses: {
        200: {
          description: 'Vendor product price deleted successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example: 'Vendor product price deleted successfully',
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
});

export const VendorProductPricePaths = {
  ...buildVendorProductPricePaths('/api/domain/vendor-product-prices', [
    'Vendor Product Prices',
  ]),
  ...buildVendorProductPricePaths('/api/user/vendor-product-prices', [
    'User Vendor Product Prices',
  ]),
};
