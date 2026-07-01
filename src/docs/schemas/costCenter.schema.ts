export const CostCenterSchemas = {
  CostCenterObject: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        example: '701fcaee-9dfa-452d-b0bb-a69714788c91',
      },
      name: {
        type: 'object',
        example: {
          en: 'Head Office 1782794791',
        },
      },
      code: {
        type: 'string',
        example: 'HEAD_OFFICE_1782794791',
      },
      searchText: {
        type: 'string',
        example: 'head office 1782794791 head_office_1782794791',
      },
      description: {
        type: 'string',
        example: 'Corporate cost center',
      },
      parentId: {
        type: 'string',
        nullable: true,
        example: null,
      },
      path: {
        type: 'string',
        format: 'uuid',
        example: '701fcaee-9dfa-452d-b0bb-a69714788c91',
      },
      level: {
        type: 'integer',
        example: 0,
      },
      childrenCount: {
        type: 'integer',
        example: 0,
      },
      industryIds: {
        type: 'array',
        items: {
          type: 'string',
          format: 'uuid',
        },
        example: [],
      },
      industryCategoryIds: {
        type: 'array',
        items: {
          type: 'string',
          format: 'uuid',
        },
        example: [],
      },
      isSystem: {
        type: 'boolean',
        example: false,
      },
      costCenterId: {
        type: 'string',
        nullable: true,
        example: null,
      },
      projectId: {
        type: 'string',
        nullable: true,
        example: null,
      },
      domainId: {
        type: 'string',
        format: 'uuid',
        example: '32549b13-9fb7-44da-8f70-d943d997f956',
      },
      adminId: {
        type: 'string',
        format: 'uuid',
        example: '1da16956-db58-4216-81f1-30ca54876913',
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
        example: '2026-06-30T04:46:32.157Z',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        example: '2026-06-30T04:46:32.157Z',
      },
    },
  },

  CostCenterCreateBody: {
    type: 'object',
    description:
      'code and searchText are auto-generated from name — do not send them.',
    required: ['name'],
    properties: {
      name: {
        type: 'object',
        description: 'Localized name. name.en is required.',
        example: { en: 'Head Office' },
      },
      description: { type: 'string', example: 'Corporate cost center' },
      parentId: { type: 'string', format: 'uuid' },
      costCenterId: { type: 'string', format: 'uuid' },
      projectId: { type: 'string', format: 'uuid' },
      industryIds: {
        type: 'array',
        items: { type: 'string', format: 'uuid' },
        example: [],
      },
      industryCategoryIds: {
        type: 'array',
        items: { type: 'string', format: 'uuid' },
        example: [],
      },
      isSystem: { type: 'boolean' },
      status: {
        type: 'string',
        enum: ['ACTIVE', 'INACTIVE'],
        default: 'ACTIVE',
      },
    },
  },

  CostCenterUpdateBody: {
    type: 'object',
    description: 'All fields optional.',
    properties: {
      name: {
        type: 'object',
        description: 'Localized name. name.en is required when sent.',
        example: { en: 'Head Office' },
      },
      description: { type: 'string', example: 'Corporate cost center' },
      costCenterId: { type: 'string', format: 'uuid' },
      projectId: { type: 'string', format: 'uuid' },
      industryIds: {
        type: 'array',
        items: { type: 'string', format: 'uuid' },
      },
      industryCategoryIds: {
        type: 'array',
        items: { type: 'string', format: 'uuid' },
      },
      isSystem: { type: 'boolean' },
      status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
    },
  },
};
