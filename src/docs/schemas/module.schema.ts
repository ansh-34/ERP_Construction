export const ModuleSchemas = {
  Module: {
    type: 'object',
    required: ['id', 'name', 'code', 'status', 'created_at', 'updated_at'],
    properties: {
      id: {
        type: 'string',
        example: 'uuid',
      },
      name: {
        type: 'string',
        example: 'Orders',
      },
      code: {
        type: 'string',
        example: 'ORDERS',
      },
      is_system: {
        type: 'boolean',
        example: false,
      },
      is_deleted: {
        type: 'boolean',
        example: false,
      },
      status: {
        type: 'string',
        enum: ['ACTIVE', 'INACTIVE'],
        example: 'ACTIVE',
      },
      created_at: {
        type: 'string',
        format: 'date-time',
        example: '2026-01-01T10:00:00.000Z',
      },
      updated_at: {
        type: 'string',
        format: 'date-time',
        example: '2026-01-01T10:00:00.000Z',
      },
    },
  },

  AddModuleRequest: {
    type: 'object',
    required: ['name', 'code'],
    properties: {
      name: {
        type: 'string',
        example: 'Orders',
      },
      code: {
        type: 'string',
        example: 'ORDERS',
      },
    },
  },

  EditModuleRequest: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        example: 'Orders',
      },
      code: {
        type: 'string',
        example: 'ORDERS',
      },
      status: {
        type: 'string',
        enum: ['ACTIVE', 'INACTIVE'],
        example: 'ACTIVE',
      },
    },
  },

  ModuleMutationResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true,
      },
      data: {
        $ref: '#/components/schemas/Module',
      },
    },
  },

  ModuleListResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true,
      },
      data: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/Module',
        },
      },
      totalCount: {
        type: 'number',
        example: 1,
      },
    },
  },
};
