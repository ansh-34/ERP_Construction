export const UomSchemas = {
  CreateUomBody: {
    type: 'object',
    required: ['displayName', 'code', 'baseUomId', 'conversionRate'],
    properties: {
      displayName: { type: 'object', description: 'Localized name', example: { en: 'Kilogram' } },
      code: { type: 'string', example: 'KG' },
      baseUomId: { type: 'string', format: 'uuid' },
      conversionRate: { type: 'number', example: 1 },
      status: { type: 'string', default: 'active' },
    },
  },
  UpdateUomBody: {
    type: 'object',
    properties: {
      displayName: { type: 'object', example: { en: 'Kilogram Updated' } },
      code: { type: 'string' },
      baseUomId: { type: 'string', format: 'uuid' },
      conversionRate: { type: 'number' },
      status: { type: 'string' },
    },
  },
  UomObject: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      displayName: { type: 'object', example: { en: 'Kilogram' } },
      code: { type: 'string', example: 'KG' },
      baseUomId: { type: 'string', format: 'uuid' },
      conversionRate: { type: 'number', example: 1 },
      domainId: { type: 'string', format: 'uuid' },
      status: { type: 'string', example: 'active' },
      isDeleted: { type: 'boolean', example: false },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  },
  UomListResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'UOMs retrieved' },
      data: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/UomObject' },
          },
          total: { type: 'integer', example: 5 },
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 10 },
          totalPages: { type: 'integer', example: 1 },
        },
      },
    },
  },
};
