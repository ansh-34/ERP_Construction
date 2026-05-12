import { errors } from './responses.js';

const languageHeader = {
  in: 'header' as const,
  name: 'language',
  schema: { type: 'string', default: 'en', example: 'en' },
  description: 'Language code for localized response (e.g. en, hi, ar)',
};

export const UomPaths = {
  '/api/domain/uoms': {
    get: {
      tags: ['UOMs'],
      summary: 'List UOMs',
      description:
        'Retrieve a paginated list of units of measurement for the current domain. The `displayName` field is localized based on the `language` header.',
      security: [{ bearerAuth: [] }],
      parameters: [
        languageHeader,
        {
          in: 'query',
          name: 'page',
          schema: { type: 'integer', minimum: 1, default: 1 },
          description: 'Page number',
        },
        {
          in: 'query',
          name: 'limit',
          schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
          description: 'Records per page',
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
          description: 'UOMs retrieved',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'UOMs retrieved' },
                  pagination: {
                    type: 'object',
                    properties: {
                      total: { type: 'integer', example: 5 },
                      page: { type: 'integer', example: 1 },
                      limit: { type: 'integer', example: 10 },
                    },
                  },
                  data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/UomObject' },
                  },
                },
              },
              example: {
                success: true,
                message: 'UOMs retrieved',
                pagination: { total: 3, page: 1, limit: 10 },
                data: [
                  {
                    id: '7f8e9d0c-1b2a-3c4d-5e6f-7a8b9c0d1e2f',
                    displayName: 'Kilogram',
                    code: 'KILOGRAM',
                    searchText: 'kilogram किलोग्राम',
                    baseUomId: null,
                    conversionRate: 1,
                    domainId: 'd1e2f3a4-b5c6-7890-1234-56789abcdef0',
                    status: 'active',
                    isDeleted: false,
                    createdAt: '2026-05-12T10:30:00.000Z',
                    updatedAt: '2026-05-12T10:30:00.000Z',
                  },
                  {
                    id: 'e2f3a4b5-c6d7-8901-2345-6789abcdef01',
                    displayName: 'Metric Ton',
                    code: 'METRIC_TON',
                    searchText: 'metric ton मीट्रिक टन',
                    baseUomId: '7f8e9d0c-1b2a-3c4d-5e6f-7a8b9c0d1e2f',
                    conversionRate: 1000,
                    domainId: 'd1e2f3a4-b5c6-7890-1234-56789abcdef0',
                    status: 'active',
                    isDeleted: false,
                    createdAt: '2026-05-12T10:35:00.000Z',
                    updatedAt: '2026-05-12T10:35:00.000Z',
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
      tags: ['UOMs'],
      summary: 'Create UOM',
      description:
        'Create a new unit of measurement. The `displayName` accepts a JSON object with language codes as keys (e.g. `{ "en": "Kilogram", "hi": "किलोग्राम" }`). English (`en`) is required. The `code` is auto-generated from the English name.',
      security: [{ bearerAuth: [] }],
      parameters: [languageHeader],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateUomBody' },
            example: {
              displayName: { en: 'Kilogram', hi: 'किलोग्राम' },
              baseUomId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
              conversionRate: 1,
              status: 'active',
            },
          },
        },
      },
      responses: {
        201: {
          description: 'UOM created successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'UOM created successfully' },
                  data: { $ref: '#/components/schemas/UomObject' },
                },
              },
              example: {
                success: true,
                message: 'UOM created successfully',
                data: {
                  id: '7f8e9d0c-1b2a-3c4d-5e6f-7a8b9c0d1e2f',
                  displayName: 'Kilogram',
                  code: 'KILOGRAM',
                  searchText: 'kilogram किलोग्राम',
                  baseUomId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                  conversionRate: 1,
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
  '/api/domain/uoms/{id}': {
    get: {
      tags: ['UOMs'],
      summary: 'Get UOM by ID',
      description:
        'Retrieve a single UOM by ID. When `language` header is provided, the `displayName` is resolved to that language.',
      security: [{ bearerAuth: [] }],
      parameters: [
        languageHeader,
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description: 'UOM ID',
        },
      ],
      responses: {
        200: {
          description: 'UOM retrieved',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'UOMs retrieved' },
                  data: { $ref: '#/components/schemas/UomObject' },
                },
              },
              example: {
                success: true,
                message: 'UOMs retrieved',
                data: {
                  id: '7f8e9d0c-1b2a-3c4d-5e6f-7a8b9c0d1e2f',
                  displayName: 'Kilogram',
                  code: 'KILOGRAM',
                  searchText: 'kilogram किलोग्राम',
                  baseUomId: null,
                  conversionRate: 1,
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
      tags: ['UOMs'],
      summary: 'Update UOM',
      description:
        'Update UOM fields. The `displayName` field accepts localized JSON (en required when provided). If `code` is provided, duplicates are checked.',
      security: [{ bearerAuth: [] }],
      parameters: [
        languageHeader,
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description: 'UOM ID',
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UpdateUomBody' },
            example: {
              displayName: { en: 'Metric Ton', hi: 'मीट्रिक टन' },
              conversionRate: 1000,
            },
          },
        },
      },
      responses: {
        200: {
          description: 'UOM updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'UOM updated successfully' },
                  data: { $ref: '#/components/schemas/UomObject' },
                },
              },
              example: {
                success: true,
                message: 'UOM updated successfully',
                data: {
                  id: '7f8e9d0c-1b2a-3c4d-5e6f-7a8b9c0d1e2f',
                  displayName: 'Metric Ton',
                  code: 'KILOGRAM',
                  searchText: 'metric ton मीट्रिक टन',
                  baseUomId: null,
                  conversionRate: 1000,
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
      tags: ['UOMs'],
      summary: 'Delete UOM',
      description: 'Soft-delete a UOM by setting isDeleted=true and status=INACTIVE.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description: 'UOM ID',
        },
      ],
      responses: {
        200: {
          description: 'UOM deleted successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'UOM deleted successfully' },
                  data: { type: 'object', nullable: true, example: null },
                },
              },
              example: {
                success: true,
                message: 'UOM deleted successfully',
                data: null,
              },
            },
          },
        },
        ...errors,
      },
    },
  },
};
