export const RoleModulePermissionSchemas = {
  CreateModuleDependencyBody: {
    type: 'object',
    required: ['moduleId', 'dependentModuleId'],
    properties: {
      moduleId: { type: 'string' },
      dependentModuleId: { type: 'string' },
    },
  },
  SetModulePermissionsBody: {
    type: 'object',
    required: ['moduleId', 'permissions'],
    properties: {
      moduleId: { type: 'string' },
      permissions: { type: 'array', items: { type: 'string' } },
    },
  },
};
