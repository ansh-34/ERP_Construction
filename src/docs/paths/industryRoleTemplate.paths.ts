import { errors } from './responses.js';

const languageHeader = {
  in: 'header' as const,
  name: 'language',
  schema: { type: 'string', default: 'en', example: 'en' },
  description: 'Language code used to localize the name field in responses',
};

const idPathParam = {
  in: 'path' as const,
  name: 'id',
  required: true,
  schema: { type: 'string', format: 'uuid' },
  description: 'Industry role template ID',
};

const templateResponse = (message: string) => ({
  type: 'object',
  properties: {
    success: { type: 'boolean', example: true },
    message: { type: 'string', example: message },
    data: { $ref: '#/components/schemas/IndustryRoleTemplateObject' },
  },
});

export const IndustryRoleTemplatePaths = {
  '/api/admin/industry-role-templates': {
    post: {
      tags: ['Admin Industry Role Templates'],
      summary: 'Create industry role template',
      description:
        'Create a reusable role template for the authenticated admin and industry.',
      security: [{ bearerAuth: [] }],
      parameters: [languageHeader],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/CreateIndustryRoleTemplateBody',
            },
          },
        },
      },
      responses: {
        201: {
          description: 'Industry role template created successfully',
          content: {
            'application/json': {
              schema: templateResponse(
                'Industry role template created successfully',
              ),
            },
          },
        },
        ...errors,
      },
    },

    get: {
      tags: ['Admin Industry Role Templates'],
      summary: 'List industry role templates',
      description:
        'Retrieve paginated role templates for the authenticated admin. Supports search, industry, and status filters.',
      security: [{ bearerAuth: [] }],
      parameters: [
        languageHeader,
        {
          in: 'query',
          name: 'offset',
          schema: { type: 'integer', minimum: 0, default: 0 },
          description: 'Number of records to skip',
        },
        {
          in: 'query',
          name: 'limit',
          schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
          description: 'Maximum number of records to return',
        },
        {
          in: 'query',
          name: 'searchKey',
          schema: { type: 'string' },
          description: 'Search across localized role names',
        },
        {
          in: 'query',
          name: 'industry',
          schema: {
            type: 'string',
            enum: ['CONSTRUCTION', 'MANUFACTURING', 'MINING', 'PROPERTY'],
          },
          description: 'Filter by industry',
        },
        {
          in: 'query',
          name: 'status',
          schema: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
          description: 'Filter by status',
        },
      ],
      responses: {
        200: {
          description: 'Industry role templates retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example: 'Industry role templates retrieved successfully',
                  },
                  pagination: {
                    type: 'object',
                    properties: {
                      currentCount: { type: 'integer', example: 1 },
                      totalCount: { type: 'integer', example: 10 },
                      offset: { type: 'integer', example: 0 },
                      limit: { type: 'integer', example: 10 },
                    },
                  },
                  data: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/IndustryRoleTemplateObject',
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

  '/api/admin/industry-role-templates/bulk': {
    post: {
      tags: ['Admin Industry Role Templates'],
      summary: 'Bulk create industry role templates',
      description:
        'Create multiple reusable role templates for one industry. Duplicate codes are skipped and returned in the response.',
      security: [{ bearerAuth: [] }],
      parameters: [languageHeader],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/BulkCreateIndustryRoleTemplateBody',
            },
          },
        },
      },
      responses: {
        201: {
          description: 'Industry role templates created successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example: 'Industry role templates created successfully',
                  },
                  data: {
                    $ref: '#/components/schemas/BulkIndustryRoleTemplateResult',
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

  '/api/admin/industry-role-templates/{id}': {
    get: {
      tags: ['Admin Industry Role Templates'],
      summary: 'Get industry role template',
      description: 'Retrieve one industry role template by ID.',
      security: [{ bearerAuth: [] }],
      parameters: [languageHeader, idPathParam],
      responses: {
        200: {
          description: 'Industry role template retrieved successfully',
          content: {
            'application/json': {
              schema: templateResponse(
                'Industry role template retrieved successfully',
              ),
            },
          },
        },
        ...errors,
      },
    },

    put: {
      tags: ['Admin Industry Role Templates'],
      summary: 'Update industry role template',
      description: 'Update one or more fields on an industry role template.',
      security: [{ bearerAuth: [] }],
      parameters: [languageHeader, idPathParam],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/UpdateIndustryRoleTemplateBody',
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Industry role template updated successfully',
          content: {
            'application/json': {
              schema: templateResponse(
                'Industry role template updated successfully',
              ),
            },
          },
        },
        ...errors,
      },
    },

    delete: {
      tags: ['Admin Industry Role Templates'],
      summary: 'Delete industry role template',
      description: 'Soft-delete an industry role template.',
      security: [{ bearerAuth: [] }],
      parameters: [idPathParam],
      responses: {
        200: {
          description: 'Industry role template deleted successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example: 'Industry role template deleted successfully',
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
