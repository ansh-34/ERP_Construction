import { errors } from './responses.js';

const statusEnum = ['ACTIVE', 'INACTIVE'];
const idParam = {
  in: 'path',
  name: 'id',
  required: true,
  schema: { type: 'string', format: 'uuid' },
};
const paginationParams = [
  { in: 'query', name: 'offset', schema: { type: 'integer', minimum: 0 } },
  {
    in: 'query',
    name: 'limit',
    schema: { type: 'integer', minimum: 1, maximum: 100 },
  },
  { in: 'query', name: 'searchKey', schema: { type: 'string' } },
];

const userTypeBody = {
  type: 'object',
  required: ['name'],
  properties: {
    name: { type: 'object', example: { en: 'Worker' } },
    code: {
      type: 'string',
      example: 'worker',
      description:
        'Optional. If omitted while creating a system user type, backend generates it from name.en.',
    },
    description: { type: 'object', example: { en: 'Site worker' } },
    status: { type: 'string', enum: statusEnum, example: 'ACTIVE' },
  },
};

const selectAdminUserTypesBody = {
  type: 'object',
  required: ['systemUserTypeIds'],
  properties: {
    systemUserTypeIds: {
      type: 'array',
      minItems: 1,
      items: { type: 'string', format: 'uuid' },
      example: ['976bcb5b-aa2b-40cf-965a-894f6a89428b'],
    },
  },
};

const userTypeObject = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    name: { type: 'object', example: { en: 'Worker' } },
    code: { type: 'string', example: 'worker' },
    description: { type: 'object', nullable: true },
    status: { type: 'string', enum: statusEnum },
    isDeleted: { type: 'boolean' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

const selectedAdminUserTypesResponse = {
  type: 'object',
  properties: {
    created: { type: 'array', items: userTypeObject },
    skipped: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          systemUserTypeId: { type: 'string', format: 'uuid' },
          code: { type: 'string' },
          reason: { type: 'string' },
        },
      },
    },
    inserted: { type: 'integer' },
    skippedCount: { type: 'integer' },
  },
};

export const UserTypePaths = {
  '/api/superadmin/system-user-types': {
    post: {
      tags: ['System User Types'],
      summary: 'Create system user type',
      description: 'Only superadmin creates global user type master records.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: userTypeBody } },
      },
      responses: {
        201: {
          description: 'System user type created successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                  data: userTypeObject,
                },
              },
            },
          },
        },
        ...errors,
      },
    },
    get: {
      tags: ['System User Types'],
      summary: 'List system user types',
      security: [{ bearerAuth: [] }],
      parameters: [
        ...paginationParams,
        {
          in: 'query',
          name: 'status',
          schema: { type: 'string', enum: statusEnum },
        },
      ],
      responses: {
        200: {
          description: 'System user types fetched successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                  pagination: { type: 'object' },
                  data: { type: 'array', items: userTypeObject },
                },
              },
            },
          },
        },
        ...errors,
      },
    },
  },
  '/api/superadmin/system-user-types/{id}': {
    get: {
      tags: ['System User Types'],
      summary: 'Get system user type by id',
      security: [{ bearerAuth: [] }],
      parameters: [idParam],
      responses: {
        200: { description: 'System user type fetched successfully' },
        ...errors,
      },
    },
    put: {
      tags: ['System User Types'],
      summary: 'Update system user type',
      security: [{ bearerAuth: [] }],
      parameters: [idParam],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: userTypeBody } },
      },
      responses: {
        200: { description: 'System user type updated successfully' },
        ...errors,
      },
    },
    delete: {
      tags: ['System User Types'],
      summary: 'Delete system user type',
      security: [{ bearerAuth: [] }],
      parameters: [idParam],
      responses: {
        200: { description: 'System user type deleted successfully' },
        ...errors,
      },
    },
  },
  '/api/domain/admin-user-types': {
    get: {
      tags: ['Admin User Types'],
      summary: 'List active admin user types',
      description:
        'Domain-facing user type dropdown. Returns only ACTIVE and non-deleted AdminUserType rows for the authenticated admin.',
      security: [{ bearerAuth: [] }],
      parameters: paginationParams,
      responses: {
        200: {
          description: 'Admin user types fetched successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                  pagination: { type: 'object' },
                  data: { type: 'array', items: userTypeObject },
                },
              },
            },
          },
        },
        ...errors,
      },
    },
  },
  '/api/admin/admin-user-types': {
    get: {
      tags: ['Admin User Types'],
      summary: 'List admin user types',
      security: [{ bearerAuth: [] }],
      parameters: [
        ...paginationParams,
        {
          in: 'query',
          name: 'status',
          schema: { type: 'string', enum: statusEnum },
        },
      ],
      responses: {
        200: {
          description: 'Admin user types retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                  pagination: { type: 'object' },
                  data: { type: 'array', items: userTypeObject },
                },
              },
            },
          },
        },
        ...errors,
      },
    },
  },
  '/api/admin/admin-user-types/select': {
    post: {
      tags: ['Admin User Types'],
      summary: 'Select admin user types from system user types',
      description:
        'Admin selects user types during onboarding/setup. Backend copies the selected active SystemUserType rows into AdminUserType for that admin.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: selectAdminUserTypesBody,
          },
        },
      },
      responses: {
        201: {
          description: 'Admin user types selected successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                  data: selectedAdminUserTypesResponse,
                },
              },
            },
          },
        },
        ...errors,
      },
    },
  },
  '/api/admin/admin-user-types/{id}': {
    get: {
      tags: ['Admin User Types'],
      summary: 'Get admin user type by id',
      security: [{ bearerAuth: [] }],
      parameters: [idParam],
      responses: {
        200: { description: 'Admin user type retrieved successfully' },
        ...errors,
      },
    },
    delete: {
      tags: ['Admin User Types'],
      summary: 'Delete admin user type',
      security: [{ bearerAuth: [] }],
      parameters: [idParam],
      responses: {
        200: { description: 'Admin user type deleted successfully' },
        ...errors,
      },
    },
  },
};
