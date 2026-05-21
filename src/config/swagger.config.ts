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
    { name: 'Project User Roles' },
    { name: 'Raw Material Purchase Requests' },
    { name: 'Domain Projects' },
    { name: 'Domain Project Stages' },
    { name: 'Domain Project Tasks' },
    { name: 'Domain Project Task Delays' },
    { name: 'User Projects' },
    { name: 'User Project Stages' },
    { name: 'User Project Tasks' },
    { name: 'User Project Task Delays' },
    { name: 'Machinery' },
    { name: 'Machine Reading' },
    { name: 'Domain Currency' },
    { name: 'User Currency' },
    { name: 'Logs' },
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
