import { errors } from './responses.js';

const languageHeader = {
  in: 'header' as const,
  name: 'language',
  schema: { type: 'string', default: 'en', example: 'en' },
  description: 'Language code for localized fields in nested product/uom data',
};

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
  description: 'Raw material purchase requests retrieved',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: {
            type: 'string',
            example: 'Raw material purchase requests retrieved',
          },
          pagination: {
            type: 'object',
            properties: {
              currentCount: { type: 'integer', example: 2 },
              totalCount: { type: 'integer', example: 8 },
              offset: { type: 'integer', example: 0 },
              limit: { type: 'integer', example: 10 },
            },
          },
          data: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/RawMaterialPurchaseRequestObject',
            },
          },
        },
      },
    },
  },
};

const buildRmprPaths = (basePath: string, tags: string[]) => ({
  [`${basePath}`]: {
    post: {
      tags,
      summary: 'Create purchase request',
      description: 'Create a new raw material purchase request for a project.',
      security: [{ bearerAuth: [] }],
      parameters: [languageHeader],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/CreateRawMaterialPurchaseRequestBody',
            },
          },
        },
      },
      responses: {
        201: {
          description: 'Purchase request created',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example:
                      'Raw material purchase request created successfully',
                  },
                  data: {
                    $ref: '#/components/schemas/RawMaterialPurchaseRequestObject',
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
      summary: 'List purchase requests',
      description:
        'Retrieve a paginated list of raw material purchase requests with filtering by status, type, approval status, product, and project.',
      security: [{ bearerAuth: [] }],
      parameters: [
        languageHeader,
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
          description: 'Search across codes and text',
        },
        {
          in: 'query',
          name: 'type',
          schema: { type: 'string', enum: ['IMPORT', 'LOCAL'] },
        },
        {
          in: 'query',
          name: 'approvalStatus',
          schema: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED'] },
        },
        {
          in: 'query',
          name: 'productId',
          schema: { type: 'string', format: 'uuid' },
        },
        {
          in: 'query',
          name: 'projectId',
          schema: { type: 'string', format: 'uuid' },
        },
      ],
      responses: { 200: listResponse, ...errors },
    },
  },

  [`${basePath}/approval`]: {
    put: {
      tags,
      summary: 'Approve or reject requests',
      description:
        'Approve or reject one or more raw material purchase requests by their group code.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ApproveRejectBody' },
          },
        },
      },
      responses: {
        200: {
          description: 'Approval status updated',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example: 'Approval status updated successfully',
                  },
                  data: { type: 'object' },
                },
              },
            },
          },
        },
        ...errors,
      },
    },
  },

  [`${basePath}/code/{code}`]: {
    get: {
      tags,
      summary: 'Get grouped request by code',
      description:
        'Retrieve a grouped raw material purchase request by its unique code, including all product line items.',
      security: [{ bearerAuth: [] }],
      parameters: [
        languageHeader,
        {
          in: 'path',
          name: 'code',
          required: true,
          schema: { type: 'string' },
          example: 'RMPR-DOMA-1716382000000',
        },
      ],
      responses: {
        200: {
          description: 'Purchase request group retrieved',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example: 'Raw material purchase requests retrieved',
                  },
                  data: {
                    $ref: '#/components/schemas/RawMaterialPurchaseRequestObject',
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
      summary: 'Delete requests by code',
      description:
        'Soft-delete all raw material purchase requests associated with a group code.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'code',
          required: true,
          schema: { type: 'string' },
          example: 'RMPR-DOMA-1716382000000',
        },
      ],
      responses: {
        200: {
          description: 'Grouped purchase requests deleted',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example:
                      'Raw material purchase requests deleted successfully',
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

  [`${basePath}/code/{code}/product/{productId}`]: {
    put: {
      tags,
      summary: 'Update request product by code',
      description:
        'Update a specific product line item in a grouped raw material purchase request.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'code',
          required: true,
          schema: { type: 'string' },
          example: 'RMPR-DOMA-1716382000000',
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
            schema: {
              $ref: '#/components/schemas/UpdateRawMaterialPurchaseRequestBody',
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Grouped purchase request product updated',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example:
                      'Raw material purchase request updated successfully',
                  },
                  data: {
                    $ref: '#/components/schemas/RawMaterialPurchaseRequestObject',
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
      summary: 'Get request by ID',
      description: 'Retrieve a single raw material purchase request by ID.',
      security: [{ bearerAuth: [] }],
      parameters: [
        languageHeader,
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string', format: 'uuid' },
        },
      ],
      responses: {
        200: {
          description: 'Purchase request retrieved',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example: 'Raw material purchase request retrieved',
                  },
                  data: {
                    $ref: '#/components/schemas/RawMaterialPurchaseRequestObject',
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
      summary: 'Update request',
      description: 'Update a raw material purchase request.',
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
            schema: {
              $ref: '#/components/schemas/UpdateRawMaterialPurchaseRequestBody',
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Purchase request updated',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example:
                      'Raw material purchase request updated successfully',
                  },
                  data: {
                    $ref: '#/components/schemas/RawMaterialPurchaseRequestObject',
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
      summary: 'Delete request',
      description: 'Soft-delete a raw material purchase request.',
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
          description: 'Purchase request deleted',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example:
                      'Raw material purchase request deleted successfully',
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

  [`${basePath}/po`]: {
    get: {
      tags,
      summary: 'List purchase orders',
      description:
        'Retrieve a paginated list of purchase orders generated from RMPR approval.',
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
          name: 'orderStatus',
          schema: { type: 'string', enum: ['PENDING_VENDOR', 'INVOICED'] },
        },
        {
          in: 'query',
          name: 'projectId',
          schema: { type: 'string', format: 'uuid' },
        },
      ],
      responses: {
        200: {
          description: 'Purchase orders retrieved',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example: 'Purchase orders retrieved',
                  },
                  pagination: {
                    type: 'object',
                    properties: {
                      currentCount: { type: 'integer', example: 1 },
                      totalCount: { type: 'integer', example: 1 },
                      offset: { type: 'integer', example: 0 },
                      limit: { type: 'integer', example: 10 },
                    },
                  },
                  data: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/PurchaseOrderObject',
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

  [`${basePath}/po/{poId}`]: {
    get: {
      tags,
      summary: 'Get purchase order by ID',
      description:
        'Retrieve a single purchase order by its ID, with product line items nested inside.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'poId',
          required: true,
          schema: { type: 'string', format: 'uuid' },
        },
      ],
      responses: {
        200: {
          description: 'Purchase order retrieved',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example: 'Purchase order retrieved',
                  },
                  data: {
                    allOf: [
                      { $ref: '#/components/schemas/PurchaseOrderObject' },
                      {
                        type: 'object',
                        properties: {
                          purchaseOrderProducts: {
                            type: 'array',
                            items: {
                              $ref: '#/components/schemas/PurchaseOrderProductObject',
                            },
                          },
                        },
                      },
                    ],
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

  [`${basePath}/po/{poId}/products`]: {
    get: {
      tags,
      summary: 'List products in a purchase order',
      description:
        'Retrieve the product line items belonging to a purchase order.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'poId',
          required: true,
          schema: { type: 'string', format: 'uuid' },
        },
      ],
      responses: {
        200: {
          description: 'Purchase order products retrieved',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example: 'Purchase order products retrieved successfully',
                  },
                  data: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/PurchaseOrderProductObject',
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
});

export const RawMaterialPurchaseRequestPaths = {
  ...buildRmprPaths('/api/domain/rmpr', ['Raw Material Purchase Requests']),
  ...buildRmprPaths('/api/user/rmpr', ['User Raw Material Purchase Requests']),
};
