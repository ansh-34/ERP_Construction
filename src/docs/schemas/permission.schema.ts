export const PermissionSchemas = {
  CreatePermissionBody: {
    type: 'object',
    required: ['name', 'code'],
    properties: {
      name: {},
      code: { type: 'string' },
    },
  },
  UpdatePermissionBody: {
    type: 'object',
    properties: {
      name: {},
      code: { type: 'string' },
      status: { type: 'string' },
    },
  },
};
