import { ModulePaths } from '@/docs/paths/module.paths';
import { ModuleSchemas } from '@/docs/schemas/module.schema';
import { PermissionPaths } from '@/docs/paths/permission.paths';
import { PermissionSchemas } from '@/docs/schemas/permission.schema';
import { RolePaths } from '@/docs/paths/role.paths';
import { RoleSchemas } from '@/docs/schemas/role.schema';
import { RoleModulePermissionPaths } from '@/docs/paths/roleModulePermission.paths';
import { RoleModulePermissionSchemas } from '@/docs/schemas/roleModulePermission.schema';

export const swaggerSpec = {
  openapi: '3.0.0',

  info: {
    title: 'Backend API',
    version: '1.0.0',
    description: 'API documentation',
  },

  servers: [
    {
      url: 'http://localhost:5000/api',
    },
  ],

  paths: {
    ...ModulePaths,
    ...PermissionPaths,
    ...RolePaths,
    ...RoleModulePermissionPaths,
  },

  components: {
    schemas: {
      ...ModuleSchemas,
      ...PermissionSchemas,
      ...RoleSchemas,
      ...RoleModulePermissionSchemas,
    },
  },
};
