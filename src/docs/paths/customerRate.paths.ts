import { errors } from './responses.js';

const idParam = {
  in: 'path' as const,
  name: 'id',
  required: true,
  schema: { type: 'string', format: 'uuid' },
  description: 'Customer rate ID',
};

const langHeader = {
  in: 'header' as const,
  name: 'lang',
  schema: { type: 'string', example: 'en' },
  description:
    'Language code (e.g. en, hi). When provided, multilingual name fields are resolved to strings. Omit to receive raw JSON objects.',
};

const listParams = [
  { in: 'query', name: 'limit', schema: { type: 'integer', default: 10 } },
  { in: 'query', name: 'offset', schema: { type: 'integer', default: 0 } },
  {
    in: 'query',
    name: 'status',
    schema: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
  },
  {
    in: 'query',
    name: 'customerId',
    schema: { type: 'string', format: 'uuid' },
  },
  {
    in: 'query',
    name: 'productId',
    schema: { type: 'string', format: 'uuid' },
  },
  {
    in: 'query',
    name: 'productGradeId',
    schema: { type: 'string', format: 'uuid' },
  },
  langHeader,
];

const rateExample = {
  id: 'b1c2d3e4-0001-0001-0001-000000000001',
  customerId: 'a339bac0-d4cc-4468-a755-20a46ed06599',
  productId: '33333333-3333-3333-3333-333333333301',
  productGradeId: '44444444-4444-4444-4444-444444444401',
  rate: 350,
  currencyId: 'cc000000-0000-0000-0000-000000000001',
  uomId: '55555555-5555-5555-5555-555555555501',
  effectiveFrom: '2026-06-01T00:00:00.000Z',
  effectiveTo: '2026-12-31T00:00:00.000Z',
  domainId: '32549b13-9fb7-44da-8f70-d943d997f956',
  adminId: '1da16956-db58-4216-81f1-30ca54876913',
  status: 'ACTIVE',
  isDeleted: false,
  createdAt: '2026-06-24T08:00:00.000Z',
  updatedAt: '2026-06-24T08:00:00.000Z',
  customer: { id: 'a339bac0-d4cc-4468-a755-20a46ed06599', name: 'Acme Corp' },
  product: {
    id: '33333333-3333-3333-3333-333333333301',
    code: 'PRD-001',
    name: 'Portland Cement',
  },
  productGrade: {
    id: '44444444-4444-4444-4444-444444444401',
    gradeCode: 'GRD-43',
    name: 'Grade 43',
  },
  uom: { id: '55555555-5555-5555-5555-555555555501', code: 'BAG', name: 'Bag' },
  currency: {
    id: 'cc000000-0000-0000-0000-000000000001',
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
  },
};

const buildPaths = (base: string, tags: string[]) => ({
  [base]: {
    post: {
      tags,
      summary: 'Create customer rate',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CustomerRateCreateBody' },
            example: {
              customerId: 'a339bac0-d4cc-4468-a755-20a46ed06599',
              productId: '33333333-3333-3333-3333-333333333301',
              productGradeId: '44444444-4444-4444-4444-444444444401',
              rate: 350,
              currencyId: 'cc000000-0000-0000-0000-000000000001',
              uomId: '55555555-5555-5555-5555-555555555501',
              effectiveFrom: '2026-06-01T00:00:00.000Z',
              effectiveTo: '2026-12-31T00:00:00.000Z',
              status: 'ACTIVE',
            },
          },
        },
      },
      responses: {
        201: {
          description: 'Customer rate created successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CustomerRateSingleResponse',
              },
              example: {
                success: true,
                message: 'Customer rate created successfully',
                data: rateExample,
              },
            },
          },
        },
        ...errors,
      },
    },
    get: {
      tags,
      summary: 'List customer rates',
      description:
        'Send `lang` header to flatten multilingual name fields to a string. Without it, `name` fields are raw JSON objects.',
      security: [{ bearerAuth: [] }],
      parameters: listParams,
      responses: {
        200: {
          description: 'Customer rates retrieved successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CustomerRateListResponse' },
              example: {
                success: true,
                message: 'Customer rates retrieved successfully',
                pagination: {
                  currentCount: 1,
                  totalCount: 1,
                  offset: 0,
                  limit: 10,
                },
                data: [rateExample],
              },
            },
          },
        },
        ...errors,
      },
    },
  },

  [`${base}/{id}`]: {
    get: {
      tags,
      summary: 'Get customer rate by ID',
      security: [{ bearerAuth: [] }],
      parameters: [idParam, langHeader],
      responses: {
        200: {
          description: 'Customer rate retrieved successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CustomerRateSingleResponse',
              },
              example: {
                success: true,
                message: 'Customer rate retrieved successfully',
                data: rateExample,
              },
            },
          },
        },
        ...errors,
      },
    },
    put: {
      tags,
      summary: 'Update customer rate',
      security: [{ bearerAuth: [] }],
      parameters: [idParam],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CustomerRateUpdateBody' },
            example: { rate: 400, effectiveFrom: '2026-07-01T00:00:00.000Z' },
          },
        },
      },
      responses: {
        200: {
          description: 'Customer rate updated successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CustomerRateSingleResponse',
              },
              example: {
                success: true,
                message: 'Customer rate updated successfully',
                data: { ...rateExample, rate: 400 },
              },
            },
          },
        },
        ...errors,
      },
    },
    delete: {
      tags,
      summary: 'Delete customer rate (soft delete)',
      security: [{ bearerAuth: [] }],
      parameters: [idParam],
      responses: {
        200: {
          description: 'Customer rate deleted successfully',
          content: {
            'application/json': {
              example: {
                success: true,
                message: 'Customer rate deleted successfully',
                data: null,
              },
            },
          },
        },
        ...errors,
      },
    },
  },
});

export const CustomerRatePaths = {
  ...buildPaths('/api/domain/customer-rates', ['Domain Customer Rates']),
  ...buildPaths('/api/user/customer-rates', ['User Customer Rates']),
};
