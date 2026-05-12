export const UomSchemas = {
  CreateUomBody: {
    type: 'object',
    required: ['displayName', 'baseUomId', 'conversionRate'],
    properties: {
      displayName: {
        type: 'object',
        description: 'Localized UOM name. English (en) key is required.',
        example: { en: 'Kilogram', hi: 'किलोग्राम' },
        additionalProperties: { type: 'string' },
      },
      baseUomId: {
        type: 'string',
        format: 'uuid',
        example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      },
      conversionRate: { type: 'number', minimum: 0, example: 1 },
      status: {
        type: 'string',
        enum: ['active', 'inactive'],
        default: 'active',
        example: 'active',
      },
    },
  },
  UpdateUomBody: {
    type: 'object',
    properties: {
      displayName: {
        type: 'object',
        description: 'Localized UOM name. English (en) key is required when provided.',
        example: { en: 'Metric Ton', hi: 'मीट्रिक टन' },
        additionalProperties: { type: 'string' },
      },
      code: { type: 'string', example: 'MT' },
      baseUomId: { type: 'string', format: 'uuid' },
      conversionRate: { type: 'number', minimum: 0, example: 1000 },
      status: { type: 'string', enum: ['active', 'inactive'] },
    },
  },
  UomObject: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid', example: '7f8e9d0c-1b2a-3c4d-5e6f-7a8b9c0d1e2f' },
      displayName: { type: 'string', example: 'Kilogram' },
      code: { type: 'string', example: 'KILOGRAM' },
      searchText: { type: 'string', example: 'kilogram किलोग्राम' },
      baseUomId: { type: 'string', format: 'uuid', nullable: true },
      conversionRate: { type: 'number', example: 1 },
      domainId: { type: 'string', format: 'uuid', example: 'd1e2f3a4-b5c6-7890-1234-56789abcdef0' },
      status: { type: 'string', example: 'active' },
      isDeleted: { type: 'boolean', example: false },
      createdAt: { type: 'string', format: 'date-time', example: '2026-05-12T10:30:00.000Z' },
      updatedAt: { type: 'string', format: 'date-time', example: '2026-05-12T10:30:00.000Z' },
    },
  },
};
