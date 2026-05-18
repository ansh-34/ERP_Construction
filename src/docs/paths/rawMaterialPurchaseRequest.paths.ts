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

export const RawMaterialPurchaseRequestPaths = {
  '/api/domain/raw-material-purchase-requests': {
    post: {
      tags: ['Raw Material Purchase Requests'],
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
      tags: ['Raw Material Purchase Requests'],
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

  '/api/domain/raw-material-purchase-requests/approval': {
    put: {
      tags: ['Raw Material Purchase Requests'],
      summary: 'Approve or reject requests',
      description:
        'Approve or reject one or more raw material purchase requests. Supports both single ID and bulk array of IDs.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ApproveRejectBody' },
            examples: {
              single: {
                summary: 'Single approval',
                value: {
                  ids: '5c6d7e8f-9012-3456-7890-abcdef123456',
                  approvalStatus: 'APPROVED',
                },
              },
              bulk: {
                summary: 'Bulk approval',
                value: {
                  ids: [
                    '5c6d7e8f-9012-3456-7890-abcdef123456',
                    '6d7e8f90-1234-5678-90ab-cdef12345678',
                  ],
                  approvalStatus: 'APPROVED',
                },
              },
            },
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
                    example: 'Approval status updated',
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

  '/api/domain/raw-material-purchase-requests/{id}': {
    get: {
      tags: ['Raw Material Purchase Requests'],
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
      tags: ['Raw Material Purchase Requests'],
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
      tags: ['Raw Material Purchase Requests'],
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
};
