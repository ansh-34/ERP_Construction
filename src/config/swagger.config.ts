import variables from './variables.config.js';
import { ApiPaths } from '../docs/paths/api.paths.js';
import { ApiSchemas } from '../docs/schemas/api.schema.js';

export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'RBAC Multi-Tenant API',
    version: '1.0.0',
    description: 'Interactive API documentation for all RBAC endpoints.',
  },
  servers: [
    {
      url: `http://localhost:${variables.PORT}`,
    },
  ],
  tags: [
    { name: 'Health' },
    { name: 'SuperAdmin' },
    { name: 'Domain Auth' },
    { name: 'User Auth' },
    { name: 'Domain Users' },
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
    { name: 'Products' },
    { name: 'Product Grades' },
    { name: 'Product Grade Std Rates' },
    { name: 'Product UOMs' },
    { name: 'UOMs' },
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
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'token',
      },
    },
    schemas: {
      ...ApiSchemas,
    },
  },
};
