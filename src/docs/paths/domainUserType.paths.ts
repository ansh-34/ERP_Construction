import { errors } from './responses.js';

// //new: Swagger docs for the redesigned UserType (global, superadmin-owned)
// and DomainUserType (per-domain mapping) modules.

const industryEnum = [
  'CONSTRUCTION',
  'MANUFACTURING',
  'MINING',
  'PROPERTY',
  'PROPERTY_MANAGEMENT',
];

const userTypeExample = {
  id: '7ab87b72-0fce-45f7-affb-48b7d42391b0',
  name: { en: 'Safety Officer' },
  code: 'SAFETY_OFFICER',
  description: 'HSE officer',
  industryType: 'CONSTRUCTION',
  isDeleted: false,
  createdAt: '2026-07-01T07:30:55.303Z',
  updatedAt: '2026-07-01T07:30:55.303Z',
};

const domainUserTypeExample = {
  id: '0bedef9e-11bb-470c-834e-f8f3538a031a',
  domainId: '32549b13-9fb7-44da-8f70-d943d997f956',
  adminId: '1da16956-db58-4216-81f1-30ca54876913',
  userTypeId: 'edbe98ac-867d-4a19-89fa-4d695d401fd4',
  isDeleted: false,
  createdAt: '2026-07-01T07:29:28.440Z',
  updatedAt: '2026-07-01T07:29:28.440Z',
  userType: {
    id: 'edbe98ac-867d-4a19-89fa-4d695d401fd4',
    name: { en: 'Safety Officer 90967' },
    code: 'SAFETY_OFFICER_90967',
    description: null,
    industryType: 'CONSTRUCTION',
    isDeleted: false,
    createdAt: '2026-07-01T07:29:28.268Z',
    updatedAt: '2026-07-01T07:29:28.268Z',
  },
};

const paginationQuery = [
  {
    in: 'query',
    name: 'offset',
    schema: { type: 'integer', minimum: 0, default: 0 },
    description: 'Number of records to skip',
  },
  {
    in: 'query',
    name: 'limit',
    schema: { type: 'integer', minimum: 1, maximum: 500, default: 10 },
    description: 'Maximum number of records to return (max 500)',
  },
  {
    in: 'query',
    name: 'searchKey',
    schema: { type: 'string' },
    description: 'Search by user type code or English name',
  },
];

export const DomainUserTypePaths = {
  // ---- SuperAdmin: global UserType CRUD ----
  '/api/superadmin/user-types': {
    post: {
      tags: ['User Types'],
      summary: 'Create global user type',
      description:
        'Create a global user type for an industry. The `code` is auto-derived from `name.en` in UPPERCASE_SNAKE_CASE (e.g. "Safety Officer" → "SAFETY_OFFICER"), so it is never accepted in the body.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateUserTypeBody' },
            example: {
              name: { en: 'Safety Officer', ar: 'ضابط السلامة' },
              description: 'HSE officer',
              industryType: 'CONSTRUCTION',
            },
          },
        },
      },
      responses: {
        201: {
          description: 'User type created successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                  data: { $ref: '#/components/schemas/UserTypeObject' },
                },
              },
              example: {
                success: true,
                message: 'User type created successfully',
                data: userTypeExample,
              },
            },
          },
        },
        ...errors,
      },
    },
    get: {
      tags: ['User Types'],
      summary: 'List global user types',
      description:
        'Paginated list of global user types. Filter by `industryType` and/or `searchKey`.',
      security: [{ bearerAuth: [] }],
      parameters: [
        ...paginationQuery,
        {
          in: 'query',
          name: 'industryType',
          schema: { type: 'string', enum: industryEnum },
          description: 'Filter by industry',
        },
      ],
      responses: {
        200: {
          description: 'User types fetched successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                  pagination: {
                    type: 'object',
                    properties: {
                      currentCount: { type: 'integer' },
                      totalCount: { type: 'integer' },
                      offset: { type: 'integer' },
                      limit: { type: 'integer' },
                    },
                  },
                  data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/UserTypeObject' },
                  },
                },
              },
              example: {
                success: true,
                message: 'User types fetched successfully',
                pagination: {
                  currentCount: 1,
                  totalCount: 8,
                  offset: 0,
                  limit: 10,
                },
                data: [userTypeExample],
              },
            },
          },
        },
        ...errors,
      },
    },
  },
  '/api/superadmin/user-types/{id}': {
    get: {
      tags: ['User Types'],
      summary: 'Get global user type by ID',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string', format: 'uuid' },
        },
      ],
      responses: {
        200: {
          description: 'User type fetched successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                  data: { $ref: '#/components/schemas/UserTypeObject' },
                },
              },
              example: {
                success: true,
                message: 'User type fetched successfully',
                data: userTypeExample,
              },
            },
          },
        },
        ...errors,
      },
    },
    put: {
      tags: ['User Types'],
      summary: 'Update global user type',
      description:
        'Update a global user type. When `name.en` changes, the `code` is re-derived automatically.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string', format: 'uuid' },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UpdateUserTypeBody' },
            example: {
              name: { en: 'Senior Safety Officer' },
              description: 'Lead HSE officer',
            },
          },
        },
      },
      responses: {
        200: {
          description: 'User type updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                  data: { $ref: '#/components/schemas/UserTypeObject' },
                },
              },
              example: {
                success: true,
                message: 'User type updated successfully',
                data: {
                  ...userTypeExample,
                  name: { en: 'Senior Safety Officer' },
                  code: 'SENIOR_SAFETY_OFFICER',
                },
              },
            },
          },
        },
        ...errors,
      },
    },
    delete: {
      tags: ['User Types'],
      summary: 'Delete global user type',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string', format: 'uuid' },
        },
      ],
      responses: {
        200: {
          description: 'User type deleted successfully',
          content: {
            'application/json': {
              example: {
                success: true,
                message: 'User type deleted successfully',
              },
            },
          },
        },
        ...errors,
      },
    },
  },

  // ---- Domain: DomainUserType mapping ----
  '/api/domain/domain-user-types/available': {
    get: {
      tags: ['Domain User Types'],
      summary: 'List available (unmapped) global user types',
      description:
        "Lists global user types for the domain's industry that are not yet mapped to this domain, so the domain can pick which ones to adopt. Industry is taken from the authenticated token.",
      security: [{ bearerAuth: [] }],
      parameters: paginationQuery,
      responses: {
        200: {
          description: 'Available user types fetched successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                  pagination: {
                    type: 'object',
                    properties: {
                      currentCount: { type: 'integer' },
                      totalCount: { type: 'integer' },
                      offset: { type: 'integer' },
                      limit: { type: 'integer' },
                    },
                  },
                  data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/UserTypeObject' },
                  },
                },
              },
              example: {
                success: true,
                message: 'Available user types fetched successfully',
                pagination: {
                  currentCount: 1,
                  totalCount: 4,
                  offset: 0,
                  limit: 10,
                },
                data: [userTypeExample],
              },
            },
          },
        },
        ...errors,
      },
    },
  },
  '/api/domain/domain-user-types': {
    post: {
      tags: ['Domain User Types'],
      summary: 'Map one or more global user types to the domain',
      description:
        "Selects one or more global user types (by ID) and maps them into the current domain. Every ID must exist, belong to the domain's industry, and not already be mapped.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/MapDomainUserTypeBody' },
            example: {
              userTypeIds: [
                'edbe98ac-867d-4a19-89fa-4d695d401fd4',
                '17f69e43-411c-4e22-8608-e06ef734e0ad',
              ],
            },
          },
        },
      },
      responses: {
        201: {
          description: 'User types mapped to domain successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                  data: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/DomainUserTypeObject',
                    },
                  },
                },
              },
              example: {
                success: true,
                message: 'User types mapped to domain successfully',
                data: [domainUserTypeExample],
              },
            },
          },
        },
        ...errors,
      },
    },
    get: {
      tags: ['Domain User Types'],
      summary: 'List mapped domain user types',
      description:
        'Paginated list of user types mapped to the current domain, each including its source global `userType`.',
      security: [{ bearerAuth: [] }],
      parameters: paginationQuery,
      responses: {
        200: {
          description: 'Domain user types fetched successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                  pagination: {
                    type: 'object',
                    properties: {
                      currentCount: { type: 'integer' },
                      totalCount: { type: 'integer' },
                      offset: { type: 'integer' },
                      limit: { type: 'integer' },
                    },
                  },
                  data: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/DomainUserTypeObject',
                    },
                  },
                },
              },
              example: {
                success: true,
                message: 'Domain user types fetched successfully',
                pagination: {
                  currentCount: 1,
                  totalCount: 4,
                  offset: 0,
                  limit: 10,
                },
                data: [domainUserTypeExample],
              },
            },
          },
        },
        ...errors,
      },
    },
  },
  '/api/domain/domain-user-types/{id}': {
    get: {
      tags: ['Domain User Types'],
      summary: 'Get mapped domain user type by ID',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string', format: 'uuid' },
        },
      ],
      responses: {
        200: {
          description: 'Domain user type fetched successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                  data: {
                    $ref: '#/components/schemas/DomainUserTypeObject',
                  },
                },
              },
              example: {
                success: true,
                message: 'Domain user type fetched successfully',
                data: domainUserTypeExample,
              },
            },
          },
        },
        ...errors,
      },
    },
    delete: {
      tags: ['Domain User Types'],
      summary: 'Remove a domain user type mapping',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string', format: 'uuid' },
        },
      ],
      responses: {
        200: {
          description: 'Domain user type removed successfully',
          content: {
            'application/json': {
              example: {
                success: true,
                message: 'Domain user type removed successfully',
              },
            },
          },
        },
        ...errors,
      },
    },
  },
};
