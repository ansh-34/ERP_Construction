import { errors } from './responses.js';

export const LocationPaths = {
  '/api/domain/locations': {
    get: {
      tags: ['Domain Locations'],
      summary: 'List domain locations',
      description: 'Get all locations in the domain.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'query',
          name: 'domainId',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description: 'Domain ID',
        },
        {
          in: 'query',
          name: 'searchKey',
          schema: { type: 'string' },
          description: 'Search key for filtering',
        },
        {
          in: 'query',
          name: 'offset',
          schema: { type: 'integer', minimum: 0, default: 0 },
          description: 'Number of records to skip',
        },
        {
          in: 'query',
          name: 'limit',
          schema: { type: 'integer', minimum: 1, default: 10 },
          description: 'Maximum records to return',
        },
      ],
      responses: {
        200: {
          description: 'Locations retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  pagination: {
                    type: 'object',
                    properties: {
                      currentCount: { type: 'integer', example: 10 },
                      totalCount: { type: 'integer', example: 42 },
                      offset: { type: 'integer', example: 0 },
                      limit: { type: 'integer', example: 10 },
                    },
                  },
                  data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/LocationObject' },
                  },
                },
              },
            },
          },
        },
        ...errors,
      },
    },
    post: {
      tags: ['Domain Locations'],
      summary: 'Create domain location',
      description: 'Create a new location inside the domain.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateLocationBody' },
          },
        },
      },
      responses: {
        201: {
          description: 'Location created successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Location created' },
                  data: { $ref: '#/components/schemas/LocationObject' },
                },
              },
            },
          },
        },
        ...errors,
      },
    },
  },
  '/api/domain/locations/{id}': {
    get: {
      tags: ['Domain Locations'],
      summary: 'Get domain location by ID',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string', format: 'uuid' },
        },
        {
          in: 'query',
          name: 'domainId',
          required: true,
          schema: { type: 'string', format: 'uuid' },
        },
      ],
      responses: {
        200: {
          description: 'Location retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: { $ref: '#/components/schemas/LocationObject' },
                },
              },
            },
          },
        },
        ...errors,
      },
    },
    put: {
      tags: ['Domain Locations'],
      summary: 'Update domain location',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string', format: 'uuid' },
        },
        {
          in: 'query',
          name: 'domainId',
          required: true,
          schema: { type: 'string', format: 'uuid' },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UpdateLocationBody' },
          },
        },
      },
      responses: {
        200: {
          description: 'Location updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Location updated' },
                  data: { $ref: '#/components/schemas/LocationObject' },
                },
              },
            },
          },
        },
        ...errors,
      },
    },
    delete: {
      tags: ['Domain Locations'],
      summary: 'Delete domain location',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string', format: 'uuid' },
        },
        {
          in: 'query',
          name: 'domainId',
          required: true,
          schema: { type: 'string', format: 'uuid' },
        },
      ],
      responses: {
        200: {
          description: 'Location deleted successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Location deleted' },
                },
              },
            },
          },
        },
        ...errors,
      },
    },
  },
  '/api/user/locations': {
    get: {
      tags: ['User Locations'],
      summary: 'List user locations',
      description: "Get all locations for the authenticated user's domain.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'query',
          name: 'searchKey',
          schema: { type: 'string' },
          description: 'Search key for filtering',
        },
        {
          in: 'query',
          name: 'offset',
          schema: { type: 'integer', minimum: 0, default: 0 },
          description: 'Number of records to skip',
        },
        {
          in: 'query',
          name: 'limit',
          schema: { type: 'integer', minimum: 1, default: 10 },
          description: 'Maximum records to return',
        },
      ],
      responses: {
        200: {
          description: 'Locations retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  pagination: {
                    type: 'object',
                    properties: {
                      currentCount: { type: 'integer', example: 10 },
                      totalCount: { type: 'integer', example: 42 },
                      offset: { type: 'integer', example: 0 },
                      limit: { type: 'integer', example: 10 },
                    },
                  },
                  data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/LocationObject' },
                  },
                },
              },
            },
          },
        },
        ...errors,
      },
    },
    post: {
      tags: ['User Locations'],
      summary: 'Create user location',
      description: "Create a new location inside the user's domain.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['name', 'type'],
              properties: {
                name: {
                  type: 'object',
                  description:
                    'Localized name object (e.g. { "en": "Main Office" })',
                  additionalProperties: { type: 'string' },
                },
                code: { type: 'string' },
                type: { type: 'string' },
                parentLocationId: {
                  type: 'string',
                  format: 'uuid',
                  nullable: true,
                },
                status: {
                  type: 'string',
                  enum: ['ACTIVE', 'INACTIVE'],
                  default: 'ACTIVE',
                },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: 'Location created successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Location created' },
                  data: { $ref: '#/components/schemas/LocationObject' },
                },
              },
            },
          },
        },
        ...errors,
      },
    },
  },
  '/api/user/locations/{id}': {
    get: {
      tags: ['User Locations'],
      summary: 'Get user location by ID',
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
          description: 'Location retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: { $ref: '#/components/schemas/LocationObject' },
                },
              },
            },
          },
        },
        ...errors,
      },
    },
    put: {
      tags: ['User Locations'],
      summary: 'Update user location',
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
            schema: { $ref: '#/components/schemas/UpdateLocationBody' },
          },
        },
      },
      responses: {
        200: {
          description: 'Location updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Location updated' },
                  data: { $ref: '#/components/schemas/LocationObject' },
                },
              },
            },
          },
        },
        ...errors,
      },
    },
    delete: {
      tags: ['User Locations'],
      summary: 'Delete user location',
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
          description: 'Location deleted successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Location deleted' },
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
