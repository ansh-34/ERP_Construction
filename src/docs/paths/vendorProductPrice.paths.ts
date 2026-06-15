import { errors } from './responses.js';

export const VendorProductPricePaths = {
  '/api/domain/vendor/{vendorId}/product-prices': {
    post: {
      tags: ['Vendor Product Prices'],
      summary: 'Create vendor product prices',
      description: 'Bulk create vendor product prices for a vendor.',
      security: [{ bearerAuth: [] }],

      parameters: [
        {
          in: 'path',
          name: 'vendorId',
          required: true,
          schema: {
            type: 'string',
            format: 'uuid',
          },
          description: 'Vendor Id',
        },
      ],

      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/CreateVendorProductPriceRequest',
            },
          },
        },
      },

      responses: {
        201: {
          description: 'Vendor product prices created successfully',
        },
        ...errors,
      },
    },
  },

  '/api/domain/vendor/product-prices': {
    get: {
      tags: ['Vendor Product Prices'],
      summary: 'List vendor product prices',
      description: 'Retrieve paginated vendor product prices.',

      security: [{ bearerAuth: [] }],

      parameters: [
        {
          in: 'query',
          name: 'offset',
          schema: {
            type: 'integer',
            default: 0,
          },
        },
        {
          in: 'query',
          name: 'limit',
          schema: {
            type: 'integer',
            default: 10,
          },
        },
        {
          in: 'header',
          name: 'language',
          schema: {
            type: 'string',
            example: 'hi',
          },
          description: 'Language code used for translated names',
        },
      ],

      responses: {
        200: {
          description: 'Vendor product prices retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true,
                  },
                  message: {
                    type: 'string',
                    example: 'Vendor product prices retrieved successfully',
                  },
                  pagination: {
                    type: 'object',
                    properties: {
                      total: {
                        type: 'integer',
                        example: 100,
                      },
                      offset: {
                        type: 'integer',
                        example: 0,
                      },
                      limit: {
                        type: 'integer',
                        example: 10,
                      },
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

    put: {
      tags: ['Vendor Product Prices'],
      summary: 'Update vendor product prices',
      description: 'Bulk update vendor product prices.',

      security: [{ bearerAuth: [] }],

      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/UpdateVendorProductPriceRequest',
            },
          },
        },
      },

      responses: {
        200: {
          description: 'Vendor product prices updated successfully',
        },
        ...errors,
      },
    },
  },

  '/api/domain/vendor/product-prices/export': {
    get: {
      tags: ['Vendor Product Prices'],
      summary: 'Export vendor product prices',
      description: 'Export vendor product prices as CSV.',

      security: [{ bearerAuth: [] }],

      responses: {
        200: {
          description: 'CSV file generated successfully',
          content: {
            'text/csv': {
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

  '/api/domain/vendor/product-prices/import': {
    post: {
      tags: ['Vendor Product Prices'],
      summary: 'Import vendor product prices',
      description:
        'Bulk import vendor product prices from an Excel (.xlsx) file. ' +
        'Each row is upserted by vendor+product+grade+uom+currency: a matching ' +
        'price is updated, otherwise a new one is created. Rows that fail ' +
        'validation are skipped and returned in failedRows.',
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
                  description:
                    'Excel file with columns: vendorName, productCode, ' +
                    'productGradeCode, uomCode, price, currencyCode.',
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Import completed',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example: 'Vendor product prices imported successfully',
                  },
                  data: {
                    type: 'object',
                    properties: {
                      inserted: { type: 'integer', example: 12 },
                      failed: { type: 'integer', example: 1 },
                      failedRows: {
                        type: 'array',
                        items: {
                          type: 'object',
                          additionalProperties: true,
                          example: {
                            vendorName: 'Acme',
                            productCode: 'PRD-001',
                            error: 'Invalid productGradeCode',
                          },
                        },
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
  },

  '/api/domain/vendor/product-prices/{vendorProductPriceId}': {
    get: {
      tags: ['Vendor Product Prices'],
      summary: 'Get vendor product price by id',
      description: 'Retrieve vendor product price details.',

      security: [{ bearerAuth: [] }],

      parameters: [
        {
          in: 'path',
          name: 'vendorProductPriceId',
          required: true,
          schema: {
            type: 'string',
            format: 'uuid',
          },
        },
        {
          in: 'header',
          name: 'language',
          schema: {
            type: 'string',
            example: 'hi',
          },
        },
      ],

      responses: {
        200: {
          description: 'Vendor product price retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true,
                  },
                  message: {
                    type: 'string',
                    example: 'Vendor product price retrieved successfully',
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

  '/api/domain/user/{vendorId}/product-prices': {
    post: {
      tags: ['Vendor Product Prices'],
      summary: 'Create vendor product prices',
      description: 'Bulk create user product prices for a user.',
      security: [{ bearerAuth: [] }],

      parameters: [
        {
          in: 'path',
          name: 'vendorId',
          required: true,
          schema: {
            type: 'string',
            format: 'uuid',
          },
          description: 'Vendor Id',
        },
      ],

      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/CreateVendorProductPriceRequest',
            },
          },
        },
      },

      responses: {
        201: {
          description: 'User product prices created successfully',
        },
        ...errors,
      },
    },
  },

  '/api/domain/user/product-prices': {
    get: {
      tags: ['User Product Prices'],
      summary: 'List user product prices',
      description: 'Retrieve paginated user product prices.',
      security: [{ bearerAuth: [] }],

      parameters: [
        {
          in: 'query',
          name: 'offset',
          schema: {
            type: 'integer',
            default: 0,
          },
        },
        {
          in: 'query',
          name: 'limit',
          schema: {
            type: 'integer',
            default: 10,
          },
        },
        {
          in: 'header',
          name: 'language',
          schema: {
            type: 'string',
            example: 'hi',
          },
        },
      ],

      responses: {
        200: {
          description: 'User product prices retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true,
                  },
                  message: {
                    type: 'string',
                    example: 'User product prices retrieved successfully',
                  },
                  pagination: {
                    type: 'object',
                    properties: {
                      total: {
                        type: 'integer',
                        example: 100,
                      },
                      offset: {
                        type: 'integer',
                        example: 0,
                      },
                      limit: {
                        type: 'integer',
                        example: 10,
                      },
                    },
                  },
                  data: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/UserProductPriceObject',
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

    put: {
      tags: ['User Product Prices'],
      summary: 'Update user product prices',
      description: 'Bulk update user product prices.',
      security: [{ bearerAuth: [] }],

      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/UpdateVendorProductPriceRequest',
            },
          },
        },
      },

      responses: {
        200: {
          description: 'User product prices updated successfully',
        },
        ...errors,
      },
    },
  },

  '/api/domain/user/product-prices/export': {
    get: {
      tags: ['User Product Prices'],
      summary: 'Export user product prices',
      description: 'Export user product prices as CSV.',

      security: [{ bearerAuth: [] }],

      responses: {
        200: {
          description: 'CSV file generated successfully',
          content: {
            'text/csv': {
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

  '/api/domain/user/product-prices/import': {
    post: {
      tags: ['User Product Prices'],
      summary: 'Import user product prices',
      description:
        'Bulk import user product prices from an Excel (.xlsx) file. ' +
        'Each row is upserted by vendor+product+grade+uom+currency: a matching ' +
        'price is updated, otherwise a new one is created. Rows that fail ' +
        'validation are skipped and returned in failedRows.',
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
                  description:
                    'Excel file with columns: vendorName, productCode, ' +
                    'productGradeCode, uomCode, price, currencyCode.',
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Import completed',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example: 'User product prices imported successfully',
                  },
                  data: {
                    type: 'object',
                    properties: {
                      inserted: { type: 'integer', example: 12 },
                      failed: { type: 'integer', example: 1 },
                      failedRows: {
                        type: 'array',
                        items: {
                          type: 'object',
                          additionalProperties: true,
                          example: {
                            vendorName: 'Acme',
                            productCode: 'PRD-001',
                            error: 'Invalid productGradeCode',
                          },
                        },
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
  },

  '/api/domain/user/product-prices/{userProductPriceId}': {
    get: {
      tags: ['User Product Prices'],
      summary: 'Get user product price by id',
      description: 'Retrieve user product price details.',

      security: [{ bearerAuth: [] }],

      parameters: [
        {
          in: 'path',
          name: 'userProductPriceId',
          required: true,
          schema: {
            type: 'string',
            format: 'uuid',
          },
        },
        {
          in: 'header',
          name: 'language',
          schema: {
            type: 'string',
            example: 'hi',
          },
        },
      ],

      responses: {
        200: {
          description: 'User product price retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true,
                  },
                  message: {
                    type: 'string',
                    example: 'User product price retrieved successfully',
                  },
                  data: {
                    $ref: '#/components/schemas/UserProductPriceObject',
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
};
