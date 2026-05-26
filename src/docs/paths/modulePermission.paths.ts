import { errors } from './responses.js';

const listResponse = {
  200: {
    description: 'Module permissions retrieved',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: {
              type: 'string',
              example: 'Module permissions retrieved',
            },
            pagination: {
              type: 'object',
              properties: {
                currentCount: { type: 'integer' },
                totalCount: { type: 'integer' },
                offset: { type: 'integer' },
                limit: { type: 'integer' },
              },
            },
            data: { type: 'array', items: { type: 'object' } },
          },
        },
      },
    },
  },
  ...errors,
};

const buildModulePermissionGetPath = (basePath: string, tags: string[]) => ({
  [`${basePath}`]: {
    get: {
      tags,
      summary: 'List module permissions',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'query',
          name: 'offset',
          schema: { type: 'integer', minimum: 0 },
        },
        {
          in: 'query',
          name: 'limit',
          schema: { type: 'integer', minimum: 1, maximum: 100 },
        },
      ],
      responses: listResponse,
    },
  },
});

export const ModulePermissionPaths = {
  '/api/superAdmin/module-permissions/set': {
    post: {
      tags: ['Module Permissions'],
      summary: 'Set module permissions',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/SetModulePermissionsBody' },
          },
        },
      },
      responses: {
        200: {
          description: 'Module permissions set',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example: 'Module permissions set',
                  },
                  data: { type: 'object' },
                },
              },
            },
          },
        },
        ...errors,
      },
    },
  },
  '/api/superAdmin/module-permissions': {
    get: {
      tags: ['Module Permissions'],
      summary: 'List module permissions',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'query',
          name: 'offset',
          schema: { type: 'integer', minimum: 0 },
        },
        {
          in: 'query',
          name: 'limit',
          schema: { type: 'integer', minimum: 1, maximum: 100 },
        },
      ],
      responses: listResponse,
    },
  },
  '/api/superAdmin/module-permissions/{id}': {
    delete: {
      tags: ['Module Permissions'],
      summary: 'Delete module permissions record',
      security: [{ bearerAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', required: true, schema: { type: 'string' } },
      ],
      responses: {
        200: {
          description: 'Module permissions deleted',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example: 'Module permissions deleted',
                  },
                },
              },
            },
          },
        },
        ...errors,
      },
    },
  },
  ...buildModulePermissionGetPath('/api/domain/module-permissions', [
    'Domain Module Permissions',
  ]),
  ...buildModulePermissionGetPath('/api/user/module-permissions', [
    'User Module Permissions',
  ]),
};
