export const RoleModulePermissionSchemas = {
  RoleModulePermission: {
    type: 'object',
    properties: {
      id: { type: 'string', example: 'uuid' },
      role_id: { type: 'string', example: 'uuid' },
      module_id: { type: 'string', example: 'uuid' },
      permission_id: { type: 'string', example: 'uuid' },
      domain_id: { type: 'string', nullable: true, example: 'uuid' },
      status: {
        type: 'string',
        enum: ['ACTIVE', 'INACTIVE'],
        example: 'ACTIVE',
      },
      created_at: { type: 'string', format: 'date-time' },
      updated_at: { type: 'string', format: 'date-time' },
      module: { $ref: '#/components/schemas/Module' },
      permission: { $ref: '#/components/schemas/Permission' },
    },
  },

  AddRoleModulePermissionRequest: {
    type: 'object',
    required: ['role_id', 'modules'],
    properties: {
      role_id: { type: 'string', example: 'uuid' },
      modules: {
        type: 'array',
        items: {
          type: 'object',
          required: ['module_id', 'permissions'],
          properties: {
            module_id: { type: 'string', example: 'uuid' },
            permissions: {
              type: 'array',
              items: { type: 'string', example: 'uuid' },
            },
          },
        },
      },
    },
  },

  EditRoleModulePermissionRequest: {
    type: 'object',
    required: ['role_id', 'modules'],
    properties: {
      role_id: { type: 'string', example: 'uuid' },
      modules: {
        type: 'array',
        items: {
          type: 'object',
          required: ['module_id', 'permissions'],
          properties: {
            module_id: { type: 'string', example: 'uuid' },
            permissions: {
              type: 'array',
              items: { type: 'string', example: 'uuid' },
            },
          },
        },
      },
    },
  },

  RoleModulePermissionMutationResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      data: { type: 'object' },
    },
  },

  RoleModulePermissionListResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      data: {
        type: 'array',
        items: { $ref: '#/components/schemas/RoleModulePermission' },
      },
      totalCount: { type: 'number', example: 1 },
    },
  },
};
