export const LocationSchemas = {
  CreateLocationBody: {
    type: 'object',
    required: ['name', 'type', 'domainId'],
    properties: {
      name: {
        type: 'object',
        description: 'Localized name object (e.g. { "en": "Main Office" })',
        additionalProperties: { type: 'string' },
      },
      code: { type: 'string' },
      type: { type: 'string' },
      parentLocationId: { type: 'string', format: 'uuid', nullable: true },
      domainId: { type: 'string', format: 'uuid' },
      status: {
        type: 'string',
        enum: ['ACTIVE', 'INACTIVE'],
        default: 'ACTIVE',
      },
    },
  },
  UpdateLocationBody: {
    type: 'object',
    properties: {
      name: {
        type: 'object',
        description: 'Localized name object',
        additionalProperties: { type: 'string' },
      },
      code: { type: 'string' },
      type: { type: 'string' },
      parentLocationId: { type: 'string', format: 'uuid', nullable: true },
      status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
    },
  },
  LocationObject: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      name: { type: 'object', additionalProperties: { type: 'string' } },
      code: { type: 'string' },
      type: { type: 'string' },
      parentLocationId: { type: 'string', format: 'uuid', nullable: true },
      domainId: { type: 'string', format: 'uuid' },
      status: { type: 'string' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  },
};
