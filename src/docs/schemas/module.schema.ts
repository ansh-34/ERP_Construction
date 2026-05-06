export const ModuleSchemas = {
  CreateModuleBody: {
    type: 'object',
    required: ['name', 'code'],
    properties: {
      name: {},
      code: { type: 'string' },
    },
  },
  UpdateModuleBody: {
    type: 'object',
    properties: {
      name: {},
      code: { type: 'string' },
      status: { type: 'string' },
    },
  },
};
