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
      domainUserTypeCode: {
        type: 'string',
        nullable: true,
        description:
          "//new: Optional. Attaches the role to a DomainUserType mapped to this domain. Validated against the domain's mapped user types. Omit for a standalone role.",
        example: 'SAFETY_OFFICER_90926',
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
      domainUserTypeCode: {
        type: 'string',
        nullable: true,
        description:
          '//new: Set to attach the role to a mapped DomainUserType (validated), or `null` to detach and make it standalone.',
        example: 'SAFETY_OFFICER_90926',
      },
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
      name: {
        description:
          'Localized JSON object, or a flat string when the `language` header is set.',
        example: 'Site Engineer',
      },
      code: { type: 'string', example: 'site_engineer' },
      searchText: { type: 'string', example: 'site engineer साइट इंजीनियर' },
      level: { type: 'integer', example: 3 },
      modulePermissionCount: {
        type: 'integer',
        description: 'Number of modules this role has permissions on.',
        example: 0,
      },
      usersCount: {
        type: 'integer',
        description: 'Number of users assigned this role.',
        example: 0,
      },
      domainId: {
        type: 'string',
        format: 'uuid',
        example: 'd1e2f3a4-b5c6-7890-1234-56789abcdef0',
      },
      adminId: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        example: '1da16956-db58-4216-81f1-30ca54876913',
      },
      userTypeId: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'Legacy global user-type FK; `null` in the new design.',
        example: null,
      },
      userTypeCode: {
        type: 'string',
        nullable: true,
        description: 'Legacy user-type code; `null` in the new design.',
        example: null,
      },
      domainUserTypeCode: {
        type: 'string',
        nullable: true,
        description:
          '//new: The DomainUserType code this role is attached to, or `null` for a standalone role.',
        example: 'SAFETY_OFFICER_90926',
      },
      userType: {
        type: 'object',
        nullable: true,
        description:
          'Legacy embedded user-type relation; `null` in the new design.',
        example: null,
      },
      status: { type: 'string', example: 'ACTIVE' },
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
