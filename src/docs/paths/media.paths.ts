import { errors } from './responses.js';

const languageHeader = {
  in: 'header' as const,
  name: 'language',
  schema: { type: 'string', default: 'en', example: 'en' },
};

const searchQuery = {
  in: 'query' as const,
  name: 'searchKey',
  schema: { type: 'string' },
};

const typeQuery = {
  in: 'query' as const,
  name: 'type',
  schema: { type: 'string', example: 'image/png' },
  description: 'Optional raw MIME type filter.',
};

const categoryQuery = {
  in: 'query' as const,
  name: 'category',
  schema: {
    type: 'string',
    enum: ['IMAGE', 'DOCUMENT', 'VIDEO', 'PDF'],
  },
  description: 'Optional derived media category filter.',
};

const domainIdQuery = {
  in: 'query' as const,
  name: 'domainId',
  required: true,
  schema: { type: 'string', format: 'uuid' },
};

const idParam = {
  in: 'path' as const,
  name: 'id',
  required: true,
  schema: { type: 'string', format: 'uuid' },
  description: 'Media ID',
};

const mediaItemResponse = (message: string, statusCode: 200 | 201 = 200) => ({
  [statusCode]: {
    description: message,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            message: { type: 'string', example: message },
            data: { $ref: '#/components/schemas/MediaObject' },
          },
        },
      },
    },
  },
  ...errors,
});

const mediaListResponse = (message: string) => ({
  200: {
    description: message,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            message: { type: 'string', example: message },
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/MediaObject' },
            },
          },
        },
      },
    },
  },
  ...errors,
});

const mediaCreateResponse = (message: string) => ({
  201: {
    description: message,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            message: { type: 'string', example: message },
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/MediaObject' },
            },
          },
        },
      },
    },
  },
  ...errors,
});

const buildMediaPaths = ({
  basePath,
  tag,
  createSchema,
  includeDomainId,
}: {
  basePath: string;
  tag: string;
  createSchema: string;
  includeDomainId: boolean;
}) => ({
  [basePath]: {
    get: {
      tags: [tag],
      summary: `List ${tag.toLowerCase()}`,
      security: [{ bearerAuth: [] }],
      parameters: [
        languageHeader,
        ...(includeDomainId ? [domainIdQuery] : []),
        searchQuery,
        typeQuery,
        categoryQuery,
      ],
      responses: mediaListResponse('Media fetched successfully'),
    },
    post: {
      tags: [tag],
      summary: `Create ${tag.toLowerCase()}`,
      security: [{ bearerAuth: [] }],
      parameters: [languageHeader],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: { $ref: `#/components/schemas/${createSchema}` },
          },
        },
      },
      responses: mediaCreateResponse('Media created successfully'),
    },
  },
  [`${basePath}/{id}`]: {
    get: {
      tags: [tag],
      summary: `Get ${tag.toLowerCase()} by ID`,
      security: [{ bearerAuth: [] }],
      parameters: [
        languageHeader,
        idParam,
        ...(includeDomainId ? [domainIdQuery] : []),
      ],
      responses: mediaItemResponse('Media fetched successfully'),
    },
    put: {
      tags: [tag],
      summary: `Update ${tag.toLowerCase()}`,
      security: [{ bearerAuth: [] }],
      parameters: [
        languageHeader,
        idParam,
        ...(includeDomainId ? [domainIdQuery] : []),
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UpdateMediaBody' },
          },
        },
      },
      responses: mediaItemResponse('Media updated successfully'),
    },
    delete: {
      tags: [tag],
      summary: `Delete ${tag.toLowerCase()}`,
      security: [{ bearerAuth: [] }],
      parameters: [idParam, ...(includeDomainId ? [domainIdQuery] : [])],
      responses: mediaItemResponse('Media deleted successfully'),
    },
  },
});

export const MediaPaths = {
  ...buildMediaPaths({
    basePath: '/api/domain/media',
    tag: 'Domain Media',
    createSchema: 'CreateMediaBody',
    includeDomainId: true,
  }),
  ...buildMediaPaths({
    basePath: '/api/user/media',
    tag: 'User Media',
    createSchema: 'CreateUserMediaBody',
    includeDomainId: false,
  }),
};
