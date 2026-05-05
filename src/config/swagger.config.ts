import variables from './variables.config.js';
import { ApiPaths } from '../docs/paths/api.paths.js';
import { ApiSchemas } from '../docs/schemas/api.schema.js';

export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Construction ERP APIs',
    version: '1.0.0',
    description:
      'Interactive API documentation for all construction ERP endpoints.',
  },
  servers: [
    {
      url: variables.BASE_URL,
    },
  ],
  tags: [
    { name: 'Health' },
    { name: 'SuperAdmin' },
    { name: 'Domain Auth' },
    { name: 'Users' },
    { name: 'Roles' },
    { name: 'Language' },
    { name: 'Vehicles' },
    { name: 'Inventory' },
    { name: 'Journey Schedules' },
    { name: 'Dispatch' },
    { name: 'App Errors' },
    { name: 'Modules' },
    { name: 'Permissions' },
    { name: 'Module Dependencies' },
    { name: 'Module Permissions' },
  ],
  paths: {
    ...ApiPaths,
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      ...ApiSchemas,
    },
  },
};
