export const RoleSchemas = {
  CreateRoleBody: {
    type: 'object',
    required: ['name', 'code'],
    properties: {
      name: {},
      code: { type: 'string' },
      level: { type: 'number' },
    },
  },
  AssignPermissionsBody: {
    type: 'object',
    required: ['moduleId', 'permissions'],
    properties: {
      moduleId: { type: 'string' },
      permissions: { type: 'array', items: { type: 'string' } },
    },
  },
  AssignRoleBody: {
    type: 'object',
    required: ['roleId'],
    properties: {
      roleId: { type: 'string' },
    },
  },
};
