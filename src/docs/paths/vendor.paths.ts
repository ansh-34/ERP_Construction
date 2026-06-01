import { errors } from './responses.js';

const idParameter = {
  in: 'path' as const,
  name: 'id',
  required: true,
  schema: { type: 'string', format: 'uuid' },
  description: 'Vendor ID',
};

const dataResponse = (description: string, schema = 'VendorObject') => ({
  description,
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: description },
          data: { $ref: `#/components/schemas/${schema}` },
        },
      },
    },
  },
});

const buildVendorPaths = (basePath: string, tags: string[]) => ({
  [basePath]: {
    get: {
      tags,
      summary: 'List vendors',
      security: [{ bearerAuth: [] }],
      parameters: [
        { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
        {
          in: 'query',
          name: 'limit',
          schema: { type: 'integer', default: 10 },
        },
        {
          in: 'query',
          name: 'status',
          schema: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
        },
        { in: 'query', name: 'searchKey', schema: { type: 'string' } },
      ],
      responses: {
        200: {
          description: 'Vendors retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string' },
                  pagination: { type: 'object' },
                  data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/VendorObject' },
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
      summary: 'Create vendor',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateVendorBody' },
          },
        },
      },
      responses: {
        201: dataResponse('Vendor created successfully'),
        ...errors,
      },
    },
  },
  [`${basePath}/{id}`]: {
    get: {
      tags,
      summary: 'Get vendor by ID',
      security: [{ bearerAuth: [] }],
      parameters: [idParameter],
      responses: {
        200: dataResponse('Vendor retrieved successfully'),
        ...errors,
      },
    },
    put: {
      tags,
      summary: 'Update vendor',
      security: [{ bearerAuth: [] }],
      parameters: [idParameter],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UpdateVendorBody' },
          },
        },
      },
      responses: {
        200: dataResponse('Vendor updated successfully'),
        ...errors,
      },
    },
    delete: {
      tags,
      summary: 'Delete vendor',
      security: [{ bearerAuth: [] }],
      parameters: [idParameter],
      responses: {
        200: dataResponse('Vendor deleted successfully'),
        ...errors,
      },
    },
  },
});

export const VendorPaths = {
  ...buildVendorPaths('/api/domain/vendors', ['Vendors']),
  ...buildVendorPaths('/api/user/vendors', ['User Vendors']),
};
