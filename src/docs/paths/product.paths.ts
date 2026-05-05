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

export const ProductPaths = {
  '/api/domain/products': {
    get: {
      tags: ['Products'],
      summary: 'List products',
      description:
        'Returns paginated list with _count of grades, UOMs, and inventories per product.',
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
      tags: ['Products'],
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
  '/api/domain/products/{id}': {
    get: {
      tags: ['Products'],
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
      tags: ['Products'],
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
      tags: ['Products'],
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

  // Product Grades
  '/api/domain/products/{productId}/grades': {
    get: {
      tags: ['Product Grades'],
      summary: 'List product grades',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'productId',
          required: true,
          schema: { type: 'string', format: 'uuid' },
        },
        { in: 'query', name: 'page', schema: { type: 'integer', minimum: 1 } },
        {
          in: 'query',
          name: 'limit',
          schema: { type: 'integer', minimum: 1, maximum: 100 },
        },
      ],
      responses: { ...dataMsg('Product grades retrieved'), ...errors },
    },
    post: {
      tags: ['Product Grades'],
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
  },
  '/api/domain/products/{productId}/grades/{id}': {
    get: {
      tags: ['Product Grades'],
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
      tags: ['Product Grades'],
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
      tags: ['Product Grades'],
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

  // Product Grade Std Rates
  '/api/domain/products/{productId}/grades/{gradeId}/std-rates': {
    get: {
      tags: ['Product Grade Std Rates'],
      summary: 'List product grade standard rates',
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
          name: 'gradeId',
          required: true,
          schema: { type: 'string', format: 'uuid' },
        },
        { in: 'query', name: 'page', schema: { type: 'integer', minimum: 1 } },
        {
          in: 'query',
          name: 'limit',
          schema: { type: 'integer', minimum: 1, maximum: 100 },
        },
      ],
      responses: { ...dataMsg('Standard rates retrieved'), ...errors },
    },
    post: {
      tags: ['Product Grade Std Rates'],
      summary: 'Create product grade standard rate',
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
          name: 'gradeId',
          required: true,
          schema: { type: 'string', format: 'uuid' },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/CreateProductGradeStdRateBody',
            },
          },
        },
      },
      responses: { ...createdMsg('Standard rate created'), ...errors },
    },
  },

  // Product UOMs
  '/api/domain/products/{productId}/uoms': {
    get: {
      tags: ['Product UOMs'],
      summary: 'List product UOMs',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'productId',
          required: true,
          schema: { type: 'string', format: 'uuid' },
        },
        { in: 'query', name: 'page', schema: { type: 'integer', minimum: 1 } },
        {
          in: 'query',
          name: 'limit',
          schema: { type: 'integer', minimum: 1, maximum: 100 },
        },
      ],
      responses: { ...dataMsg('Product UOMs retrieved'), ...errors },
    },
    post: {
      tags: ['Product UOMs'],
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
  '/api/domain/products/{productId}/uoms/{id}': {
    get: {
      tags: ['Product UOMs'],
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
      tags: ['Product UOMs'],
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
