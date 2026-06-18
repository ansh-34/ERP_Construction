import { errors } from './responses.js';

const successMsg = (msg: string) => ({
  200: {
    description: msg,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: msg },
          },
        },
      },
    },
  },
});

const createdMsg = (msg: string, ref?: string) => ({
  201: {
    description: msg,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: msg },
            ...(ref
              ? { data: { $ref: `#/components/schemas/${ref}` } }
              : { data: {} }),
          },
        },
      },
    },
  },
});

const dataMsg = (msg: string, ref?: string) => ({
  200: {
    description: msg,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: msg },
            ...(ref
              ? { data: { $ref: `#/components/schemas/${ref}` } }
              : { data: {} }),
          },
        },
      },
    },
  },
});

const buildProductPaths = (basePath: string, isUser: boolean) => {
  const scopeTag = isUser ? 'User ' : '';
  const productsTag = `${scopeTag}Products`;
  const gradesTag = `${scopeTag}Product Grades`;
  const uomsTag = `${scopeTag}Product UOMs`;

  return {
    [`${basePath}`]: {
      get: {
        tags: [productsTag],
        summary: 'List products',
        description:
          'Returns paginated list with grade/UOM counts plus gradeIds, uomIds, and inventories per product.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'query',
            name: 'page',
            schema: { type: 'integer', minimum: 1, default: 1 },
          },
          {
            in: 'query',
            name: 'limit',
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
          },
          { in: 'query', name: 'status', schema: { type: 'string' } },
          {
            in: 'query',
            name: 'searchKey',
            schema: { type: 'string' },
            description: 'Search products by name keyword',
          },
        ],
        responses: {
          200: {
            description: 'Products retrieved',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ProductListResponse' },
              },
            },
          },
          ...errors,
        },
      },
      post: {
        tags: [productsTag],
        summary: 'Create product',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateProductBody' },
            },
          },
        },
        responses: { ...createdMsg('Product created'), ...errors },
      },
    },
    [`${basePath}/{id}`]: {
      get: {
        tags: [productsTag],
        summary: 'Get product by ID',
        description:
          'Returns full product detail with all nested grades, std rates, inventories, and UOMs.',
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
            description: 'Product detail retrieved',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ProductDetailResponse' },
              },
            },
          },
          ...errors,
        },
      },
      put: {
        tags: [productsTag],
        summary: 'Update product',
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
              schema: { $ref: '#/components/schemas/UpdateProductBody' },
            },
          },
        },
        responses: { ...dataMsg('Product updated'), ...errors },
      },
      delete: {
        tags: [productsTag],
        summary: 'Delete product',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: { ...successMsg('Product deleted'), ...errors },
      },
    },
    [`${basePath}/grades`]: {
      get: {
        tags: [gradesTag],
        summary: `List all product grades globally in ${isUser ? 'user context' : 'domain'}`,
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'header',
            name: 'language',
            schema: { type: 'string', default: 'en' },
          },
          {
            in: 'query',
            name: 'page',
            schema: { type: 'integer', minimum: 1 },
          },
          {
            in: 'query',
            name: 'limit',
            schema: { type: 'integer', minimum: 1, maximum: 100 },
          },
        ],
        responses: {
          200: {
            description:
              'All product grades retrieved successfully along with their product info.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/DomainProductGradesListResponse',
                },
              },
            },
          },
          ...errors,
        },
      },
    },
    [`${basePath}/uoms`]: {
      get: {
        tags: [uomsTag],
        summary: `List all product UOM assignments globally in ${isUser ? 'user context' : 'domain'}`,
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'query',
            name: 'page',
            schema: { type: 'integer', minimum: 1 },
          },
          {
            in: 'query',
            name: 'limit',
            schema: { type: 'integer', minimum: 1, maximum: 100 },
          },
        ],
        responses: {
          200: {
            description: 'All product UOM assignments retrieved successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: {
                      type: 'string',
                      example: 'Product UOMs retrieved successfully',
                    },
                    data: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/ProductUomObject',
                      },
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
    [`${basePath}/{productId}/grades`]: {
      get: {
        tags: [gradesTag],
        summary: 'List product grades',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'productId',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
          {
            in: 'query',
            name: 'page',
            schema: { type: 'integer', minimum: 1 },
          },
          {
            in: 'query',
            name: 'limit',
            schema: { type: 'integer', minimum: 1, maximum: 100 },
          },
        ],
        responses: { ...dataMsg('Product grades retrieved'), ...errors },
      },
      post: {
        tags: [gradesTag],
        summary: 'Create product grade',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'productId',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateProductGradeBody' },
            },
          },
        },
        responses: { ...createdMsg('Product grade created'), ...errors },
      },
      put: {
        tags: [productsTag],
        summary: 'Bulk update product grades',
        description:
          'Replace/update grades for a product. Grades with id are updated, without id are created.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'productId',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/BulkUpdateGradesBody',
              },
            },
          },
        },
        responses: {
          ...successMsg('Product grades updated successfully'),
          ...errors,
        },
      },
    },
    [`${basePath}/{productId}/grades/{id}`]: {
      get: {
        tags: [gradesTag],
        summary: 'Get product grade by ID',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'productId',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: { ...dataMsg('Product grade retrieved'), ...errors },
      },
      put: {
        tags: [gradesTag],
        summary: 'Update product grade',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'productId',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
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
              schema: { $ref: '#/components/schemas/UpdateProductGradeBody' },
            },
          },
        },
        responses: { ...dataMsg('Product grade updated'), ...errors },
      },
      delete: {
        tags: [gradesTag],
        summary: 'Delete product grade',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'productId',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: { ...successMsg('Product grade deleted'), ...errors },
      },
    },
    [`${basePath}/{productId}/uoms`]: {
      get: {
        tags: [uomsTag],
        summary: 'List product UOMs',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'productId',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
          {
            in: 'query',
            name: 'page',
            schema: { type: 'integer', minimum: 1 },
          },
          {
            in: 'query',
            name: 'limit',
            schema: { type: 'integer', minimum: 1, maximum: 100 },
          },
        ],
        responses: { ...dataMsg('Product UOMs retrieved'), ...errors },
      },
      post: {
        tags: [uomsTag],
        summary: 'Assign UOM to product',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'productId',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateProductUomBody' },
            },
          },
        },
        responses: { ...createdMsg('UOM assigned to product'), ...errors },
      },
    },
    [`${basePath}/{productId}/uoms/{id}`]: {
      get: {
        tags: [uomsTag],
        summary: 'Get product UOM by ID',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'productId',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: { ...dataMsg('Product UOM retrieved'), ...errors },
      },
      delete: {
        tags: [uomsTag],
        summary: 'Delete product UOM',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'productId',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: { ...successMsg('Product UOM deleted'), ...errors },
      },
    },
  };
};

export const ProductPaths = {
  ...buildProductPaths('/api/domain/products', false),
  ...buildProductPaths('/api/user/products', true),

  // ── Standalone flat global query endpoints ───────────────────
  '/api/domain/grades': {
    get: {
      tags: ['Product Grades'],
      summary: 'List all product grades globally in domain',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'header',
          name: 'language',
          schema: { type: 'string', default: 'en' },
        },
        {
          in: 'query',
          name: 'page',
          schema: { type: 'integer', minimum: 1 },
        },
        {
          in: 'query',
          name: 'limit',
          schema: { type: 'integer', minimum: 1, maximum: 100 },
        },
      ],
      responses: {
        200: {
          description:
            'All product grades retrieved successfully along with their product info.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/DomainProductGradesListResponse',
              },
            },
          },
        },
        ...errors,
      },
    },
  },
  '/api/user/grades': {
    get: {
      tags: ['User Product Grades'],
      summary: 'List all product grades globally in user context',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'header',
          name: 'language',
          schema: { type: 'string', default: 'en' },
        },
        {
          in: 'query',
          name: 'page',
          schema: { type: 'integer', minimum: 1 },
        },
        {
          in: 'query',
          name: 'limit',
          schema: { type: 'integer', minimum: 1, maximum: 100 },
        },
      ],
      responses: {
        200: {
          description:
            'All product grades retrieved successfully along with their product info.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/DomainProductGradesListResponse',
              },
            },
          },
        },
        ...errors,
      },
    },
  },
};
