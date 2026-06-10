export const IndustryRoleTemplateSchemas = {
  LocalizedIndustryRoleTemplateName: {
    type: 'object',
    description: 'Localized name. English (en) translation is required.',
    required: ['en'],
    additionalProperties: { type: 'string' },
    example: {
      en: 'Site Engineer',
      hi: 'Site Engineer',
    },
  },

  CreateIndustryRoleTemplateBody: {
    type: 'object',
    required: ['name', 'industry'],
    properties: {
      name: { $ref: '#/components/schemas/LocalizedIndustryRoleTemplateName' },
      code: {
        type: 'string',
        example: 'site_engineer',
        description:
          'Optional role code. If omitted, it is generated from name.en.',
      },
      level: {
        type: 'integer',
        minimum: 0,
        default: 4,
        example: 4,
      },
      industry: {
        type: 'string',
        enum: ['CONSTRUCTION', 'MANUFACTURING', 'MINING', 'PROPERTY'],
        example: 'CONSTRUCTION',
      },
      status: {
        type: 'string',
        enum: ['ACTIVE', 'INACTIVE'],
        example: 'ACTIVE',
      },
    },
  },

  BulkCreateIndustryRoleTemplateBody: {
    type: 'object',
    required: ['industry', 'roles'],
    properties: {
      industry: {
        type: 'string',
        enum: ['CONSTRUCTION', 'MANUFACTURING', 'MINING', 'PROPERTY'],
        example: 'CONSTRUCTION',
      },
      roles: {
        type: 'array',
        minItems: 1,
        items: {
          type: 'object',
          required: ['name'],
          properties: {
            name: {
              $ref: '#/components/schemas/LocalizedIndustryRoleTemplateName',
            },
            code: {
              type: 'string',
              example: 'site_engineer',
            },
            level: {
              type: 'integer',
              minimum: 0,
              default: 4,
              example: 4,
            },
            status: {
              type: 'string',
              enum: ['ACTIVE', 'INACTIVE'],
              example: 'ACTIVE',
            },
          },
        },
      },
    },
  },

  UpdateIndustryRoleTemplateBody: {
    type: 'object',
    minProperties: 1,
    properties: {
      name: { $ref: '#/components/schemas/LocalizedIndustryRoleTemplateName' },
      code: {
        type: 'string',
        example: 'senior_site_engineer',
      },
      level: {
        type: 'integer',
        minimum: 0,
        example: 5,
      },
      industry: {
        type: 'string',
        enum: ['CONSTRUCTION', 'MANUFACTURING', 'MINING', 'PROPERTY'],
        example: 'CONSTRUCTION',
      },
      status: {
        type: 'string',
        enum: ['ACTIVE', 'INACTIVE'],
        example: 'ACTIVE',
      },
    },
  },

  IndustryRoleTemplateObject: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        example: 'c9a2f1e0-3b4d-4f5a-8e6c-1a2b3c4d5e6f',
      },
      name: {
        type: 'string',
        example: 'Site Engineer',
      },
      code: {
        type: 'string',
        example: 'site_engineer',
      },
      level: {
        type: 'integer',
        example: 4,
      },
      industry: {
        type: 'string',
        example: 'CONSTRUCTION',
      },
      searchText: {
        type: 'string',
        example: 'site engineer',
      },
      adminId: {
        type: 'string',
        format: 'uuid',
        example: 'd1e2f3a4-b5c6-7890-1234-56789abcdef0',
      },
      status: {
        type: 'string',
        example: 'ACTIVE',
      },
      isDeleted: {
        type: 'boolean',
        example: false,
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        example: '2026-06-10T10:30:00.000Z',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        example: '2026-06-10T10:30:00.000Z',
      },
    },
  },

  BulkIndustryRoleTemplateResult: {
    type: 'object',
    properties: {
      created: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/IndustryRoleTemplateObject',
        },
      },
      skipped: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: {
              $ref: '#/components/schemas/LocalizedIndustryRoleTemplateName',
            },
            code: {
              type: 'string',
              example: 'site_engineer',
            },
            reason: {
              type: 'string',
              example: 'duplicate code',
            },
          },
        },
      },
      inserted: {
        type: 'integer',
        example: 1,
      },
      skippedCount: {
        type: 'integer',
        example: 0,
      },
    },
  },
};
