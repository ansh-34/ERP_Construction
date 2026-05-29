import { errors } from './responses.js';

const languageHeader = {
  in: 'header' as const,
  name: 'language',
  schema: { type: 'string', default: 'en', example: 'en' },
  description: 'Language code for localized response (e.g. en, hi, ar)',
};

export const RolePaths = {
  '/api/domain/roles': {
    get: {
      tags: ['Roles'],
      summary: 'List roles',
      description:
        'Retrieve a paginated list of roles for the current domain. Supports search and status filtering. The `name` field is localized based on the `language` header.',
      security: [{ bearerAuth: [] }],
      parameters: [
        languageHeader,
        {
          in: 'query',
          name: 'offset',
          schema: { type: 'integer', minimum: 0, default: 0 },
          description: 'Number of records to skip',
        },
        {
          in: 'query',
          name: 'limit',
          schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
          description: 'Maximum number of records to return',
        },
        {
          in: 'query',
          name: 'status',
          schema: { type: 'string', enum: ['active', 'inactive'] },
          description: 'Filter by status',
        },
        {
          in: 'query',
          name: 'searchKey',
          schema: { type: 'string' },
          description: 'Search across all language translations',
        },
      ],
      responses: {
        200: {
          description: 'Roles retrieved',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Roles retrieved' },
                  pagination: {
                    type: 'object',
                    properties: {
                      currentCount: { type: 'integer', example: 2 },
                      totalCount: { type: 'integer', example: 4 },
                      offset: { type: 'integer', example: 0 },
                      limit: { type: 'integer', example: 10 },
                    },
                  },
                  data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/RoleObject' },
                  },
                },
              },
              example: {
                success: true,
                message: 'Roles retrieved',
                pagination: {
                  currentCount: 2,
                  totalCount: 4,
                  offset: 0,
                  limit: 10,
                },
                data: [
                  {
                    id: 'c9a2f1e0-3b4d-4f5a-8e6c-1a2b3c4d5e6f',
                    name: 'Site Engineer',
                    code: 'site_engineer',
                    searchText: 'site engineer',
                    level: 3,
                    domainId: 'd1e2f3a4-b5c6-7890-1234-56789abcdef0',
                    status: 'active',
                    isDeleted: false,
                    createdAt: '2026-05-12T10:30:00.000Z',
                    updatedAt: '2026-05-12T10:30:00.000Z',
                    roleModulePermissions: [
                      {
                        id: 'b1c2d3e4-f5a6-7890-bcde-f12345678901',
                        roleId: 'c9a2f1e0-3b4d-4f5a-8e6c-1a2b3c4d5e6f',
                        moduleId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
                        permissions: ['read', 'write'],
                        module: { name: 'Inventory', code: 'inventory' },
                      },
                    ],
                  },
                  {
                    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                    name: 'domain',
                    code: 'domain',
                    searchText: 'domain',
                    level: 1,
                    domainId: 'd1e2f3a4-b5c6-7890-1234-56789abcdef0',
                    status: 'active',
                    isDeleted: false,
                    createdAt: '2026-05-10T08:00:00.000Z',
                    updatedAt: '2026-05-10T08:00:00.000Z',
                    roleModulePermissions: [],
                  },
                ],
              },
            },
          },
        },
        ...errors,
      },
    },
    post: {
      tags: ['Roles'],
      summary: 'Create role',
      description:
        'Create a new role. The `name` field accepts a JSON object with language codes as keys (e.g. `{ "en": "Manager", "hi": "प्रबंधक" }`). English (`en`) is required. The `code` is auto-generated from the English name.',
      security: [{ bearerAuth: [] }],
      parameters: [languageHeader],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateRoleBody' },
            example: {
              name: { en: 'Site Engineer', hi: 'साइट इंजीनियर' },
              level: 3,
            },
          },
        },
      },
      responses: {
        201: {
          description: 'Role created successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example: 'Role created successfully',
                  },
                  data: { $ref: '#/components/schemas/RoleObject' },
                },
              },
              example: {
                success: true,
                message: 'Role created successfully',
                data: {
                  id: 'c9a2f1e0-3b4d-4f5a-8e6c-1a2b3c4d5e6f',
                  name: 'Site Engineer',
                  code: 'site_engineer',
                  searchText: 'site engineer साइट इंजीनियर',
                  level: 3,
                  domainId: 'd1e2f3a4-b5c6-7890-1234-56789abcdef0',
                  status: 'active',
                  isDeleted: false,
                  createdAt: '2026-05-12T10:30:00.000Z',
                  updatedAt: '2026-05-12T10:30:00.000Z',
                },
              },
            },
          },
        },
        ...errors,
      },
    },
  },

  '/api/domain/roles/{id}': {
    get: {
      tags: ['Roles'],
      summary: 'Get role by ID',
      description:
        'Retrieve a single role by its ID. When `language` header is provided, the `name` field is resolved to that language.',
      security: [{ bearerAuth: [] }],
      parameters: [
        languageHeader,
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description: 'Role ID',
        },
      ],
      responses: {
        200: {
          description: 'Role retrieved',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Roles retrieved' },
                  data: { $ref: '#/components/schemas/RoleObject' },
                },
              },
              example: {
                success: true,
                message: 'Roles retrieved',
                data: {
                  id: 'c9a2f1e0-3b4d-4f5a-8e6c-1a2b3c4d5e6f',
                  name: 'Site Engineer',
                  code: 'site_engineer',
                  searchText: 'site engineer साइट इंजीनियर',
                  level: 3,
                  domainId: 'd1e2f3a4-b5c6-7890-1234-56789abcdef0',
                  status: 'active',
                  isDeleted: false,
                  createdAt: '2026-05-12T10:30:00.000Z',
                  updatedAt: '2026-05-12T10:30:00.000Z',
                },
              },
            },
          },
        },
        ...errors,
      },
    },
    put: {
      tags: ['Roles'],
      summary: 'Update role',
      description:
        'Update role fields. The `name` field accepts localized JSON (en required when provided). If `code` is provided, duplicates are checked.',
      security: [{ bearerAuth: [] }],
      parameters: [
        languageHeader,
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description: 'Role ID',
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UpdateRoleBody' },
            example: {
              name: { en: 'Senior Site Engineer', hi: 'वरिष्ठ साइट इंजीनियर' },
              level: 4,
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Role updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example: 'Role updated successfully',
                  },
                  data: { $ref: '#/components/schemas/RoleObject' },
                },
              },
              example: {
                success: true,
                message: 'Role updated successfully',
                data: {
                  id: 'c9a2f1e0-3b4d-4f5a-8e6c-1a2b3c4d5e6f',
                  name: 'Senior Site Engineer',
                  code: 'site_engineer',
                  searchText: 'senior site engineer वरिष्ठ साइट इंजीनियर',
                  level: 4,
                  domainId: 'd1e2f3a4-b5c6-7890-1234-56789abcdef0',
                  status: 'active',
                  isDeleted: false,
                  createdAt: '2026-05-12T10:30:00.000Z',
                  updatedAt: '2026-05-12T11:00:00.000Z',
                },
              },
            },
          },
        },
        ...errors,
      },
    },
    delete: {
      tags: ['Roles'],
      summary: 'Delete role',
      description:
        'Soft-delete a role by setting isDeleted=true and status=INACTIVE.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description: 'Role ID',
        },
      ],
      responses: {
        200: {
          description: 'Role deleted successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example: 'Role deleted successfully',
                  },
                  data: { type: 'object', nullable: true, example: null },
                },
              },
              example: {
                success: true,
                message: 'Role deleted successfully',
                data: null,
              },
            },
          },
        },
        ...errors,
      },
    },
  },

  '/api/domain/roles/{roleId}/permissions': {
    post: {
      tags: ['Roles'],
      summary: 'Assign permissions to role for a module',
      description:
        'Assign a set of permissions to a role for a specific module. Existing permissions for the same role+module combo are replaced (upsert).',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'roleId',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description: 'Role ID',
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/AssignPermissionsBody' },
            example: {
              moduleId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
              permissions: ['read', 'write', 'update'],
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Permissions assigned to role',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Permissions assigned' },
                  data: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', format: 'uuid' },
                      roleId: { type: 'string', format: 'uuid' },
                      moduleId: { type: 'string', format: 'uuid' },
                      permissions: { type: 'array', items: { type: 'string' } },
                      domainId: { type: 'string', format: 'uuid' },
                      createdAt: { type: 'string', format: 'date-time' },
                      updatedAt: { type: 'string', format: 'date-time' },
                    },
                  },
                },
              },
              example: {
                success: true,
                message: 'Permissions assigned',
                data: {
                  id: 'b1c2d3e4-f5a6-7890-bcde-f12345678901',
                  roleId: 'c9a2f1e0-3b4d-4f5a-8e6c-1a2b3c4d5e6f',
                  moduleId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
                  permissions: ['read', 'write', 'update'],
                  domainId: 'd1e2f3a4-b5c6-7890-1234-56789abcdef0',
                  createdAt: '2026-05-12T10:30:00.000Z',
                  updatedAt: '2026-05-12T10:30:00.000Z',
                },
              },
            },
          },
        },
        ...errors,
      },
    },
  },

  '/api/domain/roles/{id}/role': {
    post: {
      tags: ['Roles'],
      summary: 'Assign role to user',
      description: 'Assign a role to an existing user in the domain.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description: 'Target user ID',
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/AssignRoleBody' },
            example: {
              roleId: 'c9a2f1e0-3b4d-4f5a-8e6c-1a2b3c4d5e6f',
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Role assigned to user',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Role assigned' },
                  data: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', format: 'uuid' },
                      name: { type: 'string', example: 'John Doe' },
                      email: { type: 'string', example: 'john@example.com' },
                      roleId: { type: 'string', format: 'uuid' },
                    },
                  },
                },
              },
              example: {
                success: true,
                message: 'Role assigned',
                data: {
                  id: 'e1f2a3b4-c5d6-7890-ef01-234567890abc',
                  name: 'John Doe',
                  email: 'john.doe@buildcorp.com',
                  roleId: 'c9a2f1e0-3b4d-4f5a-8e6c-1a2b3c4d5e6f',
                  domainId: 'd1e2f3a4-b5c6-7890-1234-56789abcdef0',
                  status: 'active',
                  isDeleted: false,
                  createdAt: '2026-05-10T08:00:00.000Z',
                  updatedAt: '2026-05-12T11:00:00.000Z',
                },
              },
            },
          },
        },
        ...errors,
      },
    },
  },
};

Object.assign(RolePaths, {
  '/api/user/roles': RolePaths['/api/domain/roles'],
  '/api/user/roles/{id}': RolePaths['/api/domain/roles/{id}'],
  '/api/user/roles/{roleId}/permissions':
    RolePaths['/api/domain/roles/{roleId}/permissions'],
  '/api/user/roles/{id}/role': RolePaths['/api/domain/roles/{id}/role'],
});
