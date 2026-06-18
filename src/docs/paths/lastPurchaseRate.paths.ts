import { errors } from './responses.js';

const listParameters = [
  { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
  { in: 'query', name: 'limit', schema: { type: 'integer', default: 10 } },
  {
    in: 'query',
    name: 'status',
    schema: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
  },
  {
    in: 'query',
    name: 'searchKey',
    schema: { type: 'string' },
    description: 'Search by vendor name',
  },
  {
    in: 'query',
    name: 'productId',
    schema: { type: 'string', format: 'uuid' },
  },
  {
    in: 'query',
    name: 'gradeId',
    schema: { type: 'string', format: 'uuid' },
    description: 'Filter by product grade (alias: productGradeId)',
  },
  {
    in: 'query',
    name: 'productGradeId',
    schema: { type: 'string', format: 'uuid' },
  },
  { in: 'query', name: 'uomId', schema: { type: 'string', format: 'uuid' } },
  {
    in: 'query',
    name: 'lang',
    schema: { type: 'string', example: 'en' },
    description:
      'When provided, flatten all multilingual name fields to this language (defaults to en). Omit to receive raw JSON objects.',
  },
];

const idParameter = {
  in: 'path' as const,
  name: 'id',
  required: true,
  schema: { type: 'string', format: 'uuid' },
  description: 'Last purchase rate ID',
};

const buildPaths = (basePath: string, tags: string[]) => ({
  [basePath]: {
    get: {
      tags,
      summary: 'List last purchase rates',
      description:
        'Returns one row per (product, grade, UOM, purchaseType) combination. ' +
        'Names are raw JSON when `lang` is omitted; flat strings when `lang` is set.',
      security: [{ bearerAuth: [] }],
      parameters: listParameters,
      responses: {
        200: {
          description: 'Last purchase rates retrieved',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/LastPurchaseRateListResponse',
              },
            },
          },
        },
        ...errors,
      },
    },
  },

  [`${basePath}/{id}`]: {
    get: {
      tags,
      summary: 'Get last purchase rate by ID',
      security: [{ bearerAuth: [] }],
      parameters: [
        idParameter,
        {
          in: 'query',
          name: 'lang',
          schema: { type: 'string', example: 'en' },
          description:
            'Flatten multilingual fields to this language. Omit for raw JSON.',
        },
      ],
      responses: {
        200: {
          description: 'Last purchase rate retrieved',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/LastPurchaseRateSingleResponse',
              },
            },
          },
        },
        ...errors,
      },
    },
  },
});

export const LastPurchaseRatePaths = {
  ...buildPaths('/api/domain/last-purchase-rates', [
    'Domain Last Purchase Rates',
  ]),
  ...buildPaths('/api/user/last-purchase-rates', ['User Last Purchase Rates']),
};
