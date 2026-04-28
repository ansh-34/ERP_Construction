export const PermissionSchemas = {
  Permission: {
    type: 'object',
    required: ['id', 'name', 'code', 'status', 'created_at', 'updated_at'],
    properties: {
      id: { type: 'string', example: 'uuid' },
      name: { type: 'string', example: 'View Orders' },
      code: { type: 'string', example: 'VIEW_ORDERS' },
      is_system: { type: 'boolean', example: false },
      is_deleted: { type: 'boolean', example: false },
      status: {
        type: 'string',
        enum: ['ACTIVE', 'INACTIVE'],
        example: 'ACTIVE',
      },
      created_at: { type: 'string', format: 'date-time' },
      updated_at: { type: 'string', format: 'date-time' },
    },
  },

  AddPermissionRequest: {
    type: 'object',
    required: ['name', 'code'],
    properties: {
      name: { type: 'string', example: 'View Orders' },
      code: { type: 'string', example: 'VIEW_ORDERS' },
    },
  },

  EditPermissionRequest: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      code: { type: 'string' },
      status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
    },
  },

  PermissionMutationResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Permission removed successfully' },
      data: { $ref: '#/components/schemas/Permission' },
    },
  },

  PermissionListResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      data: {
        type: 'array',
        items: { $ref: '#/components/schemas/Permission' },
      },
      totalCount: { type: 'number', example: 1 },
    },
  },
};
