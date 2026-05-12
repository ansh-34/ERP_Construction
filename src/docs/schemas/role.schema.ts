export const RoleSchemas = {
  CreateRoleBody: {
    type: 'object',
    required: ['name'],
    properties: {
      name: {
        type: 'object',
        description: 'Localized role name. English (en) key is required.',
        example: { en: 'Site Engineer', hi: 'साइट इंजीनियर' },
        additionalProperties: { type: 'string' },
      },
      level: { type: 'integer', example: 3 },
    },
  },
  UpdateRoleBody: {
    type: 'object',
    properties: {
      name: {
        type: 'object',
        description:
          'Localized role name. English (en) key is required when provided.',
        example: { en: 'Senior Site Engineer', hi: 'वरिष्ठ साइट इंजीनियर' },
        additionalProperties: { type: 'string' },
      },
      code: { type: 'string', example: 'SENIOR_SITE_ENGINEER' },
      level: { type: 'integer', example: 4 },
      status: {
        type: 'string',
        enum: ['active', 'inactive'],
        example: 'active',
      },
    },
  },
  AssignPermissionsBody: {
    type: 'object',
    required: ['moduleId', 'permissions'],
    properties: {
      moduleId: {
        type: 'string',
        format: 'uuid',
        example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      },
      permissions: {
        type: 'array',
        items: { type: 'string' },
        example: ['read', 'write', 'update'],
      },
    },
  },
  AssignRoleBody: {
    type: 'object',
    required: ['roleId'],
    properties: {
      roleId: {
        type: 'string',
        format: 'uuid',
        example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      },
    },
  },
  RoleObject: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        example: 'c9a2f1e0-3b4d-4f5a-8e6c-1a2b3c4d5e6f',
      },
      name: { type: 'string', example: 'Site Engineer' },
      code: { type: 'string', example: 'site_engineer' },
      searchText: { type: 'string', example: 'site engineer साइट इंजीनियर' },
      level: { type: 'integer', example: 3 },
      domainId: {
        type: 'string',
        format: 'uuid',
        example: 'd1e2f3a4-b5c6-7890-1234-56789abcdef0',
      },
      status: { type: 'string', example: 'active' },
      isDeleted: { type: 'boolean', example: false },
      createdAt: {
        type: 'string',
        format: 'date-time',
        example: '2026-05-12T10:30:00.000Z',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        example: '2026-05-12T10:30:00.000Z',
      },
      roleModulePermissions: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            roleId: { type: 'string', format: 'uuid' },
            moduleId: { type: 'string', format: 'uuid' },
            permissions: {
              type: 'array',
              items: { type: 'string' },
              example: ['read', 'write'],
            },
            module: {
              type: 'object',
              properties: {
                name: { type: 'string', example: 'Inventory' },
                code: { type: 'string', example: 'inventory' },
              },
            },
          },
        },
      },
    },
  },
};
