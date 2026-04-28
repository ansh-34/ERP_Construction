export const RoleSchemas = {
  Role: {
    type: 'object',
    required: [
      'id',
      'name',
      'code',
      'level',
      'status',
      'created_at',
      'updated_at',
    ],
    properties: {
      id: { type: 'string', example: 'uuid' },
      name: { type: 'string', example: 'Admin' },
      code: { type: 'string', example: 'ADMIN' },
      level: { type: 'number', example: 1 },
      is_system: { type: 'boolean', example: false },
      domain_id: { type: 'string', nullable: true, example: 'uuid' },
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

  AddRoleRequest: {
    type: 'object',
    required: ['name', 'code'],
    properties: {
      name: { type: 'string', example: 'Admin' },
      code: { type: 'string', example: 'ADMIN' },
      level: { type: 'number', example: 1 },
    },
  },

  EditRoleRequest: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      code: { type: 'string' },
      level: { type: 'number' },
      status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
    },
  },

  RoleMutationResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      data: { $ref: '#/components/schemas/Role' },
    },
  },

  RoleListResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      data: { type: 'array', items: { $ref: '#/components/schemas/Role' } },
      totalCount: { type: 'number', example: 1 },
    },
  },
};
