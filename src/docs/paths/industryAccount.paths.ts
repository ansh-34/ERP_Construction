import { errors } from './responses.js';

const auth = { security: [{ bearerAuth: [] }] };
const language = {
  in: 'header',
  name: 'language',
  schema: { type: 'string', default: 'en' },
};
const id = {
  in: 'path',
  name: 'id',
  required: true,
  schema: { type: 'string', format: 'uuid' },
};
const localizedName = {
  type: 'object',
  required: ['en'],
  additionalProperties: { type: 'string' },
  example: { en: 'Current Assets' },
};
const industries = ['CONSTRUCTION', 'MANUFACTURING', 'MINING', 'PROPERTY'];
const commonListParams = [
  language,
  { in: 'query', name: 'offset', schema: { type: 'integer', minimum: 0 } },
  {
    in: 'query',
    name: 'limit',
    schema: { type: 'integer', minimum: 1, maximum: 100 },
  },
  {
    in: 'query',
    name: 'industryType',
    schema: { type: 'string', enum: industries },
  },
  {
    in: 'query',
    name: 'status',
    schema: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
  },
  { in: 'query', name: 'searchKey', schema: { type: 'string' } },
];

const categoryBody = {
  type: 'object',
  required: ['name', 'categoryType', 'normalBalance', 'industryType'],
  properties: {
    name: localizedName,
    code: { type: 'string', example: 'CURRENT_ASSETS' },
    categoryType: {
      type: 'string',
      enum: ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'],
    },
    normalBalance: { type: 'string', enum: ['DEBIT', 'CREDIT'] },
    parentId: { type: 'string', format: 'uuid', nullable: true },
    industryType: { type: 'string', enum: industries },
    sortOrder: { type: 'integer', minimum: 0 },
    isPostingAllowed: { type: 'boolean' },
    isSystem: { type: 'boolean' },
    status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
  },
};

const accountBody = {
  type: 'object',
  required: ['name', 'industryAccountCategoryId', 'industryType'],
  properties: {
    name: localizedName,
    code: { type: 'string', example: 'CASH' },
    description: { type: 'string', nullable: true },
    parentId: { type: 'string', format: 'uuid', nullable: true },
    industryAccountCategoryId: { type: 'string', format: 'uuid' },
    currencyId: { type: 'string', format: 'uuid', nullable: true },
    isCashOrBank: { type: 'boolean' },
    isPostingAllowed: { type: 'boolean' },
    isSystem: { type: 'boolean' },
    sortOrder: { type: 'integer', minimum: 0 },
    industryType: { type: 'string', enum: industries },
    status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
  },
};

const response = (description: string) => ({
  description,
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: { type: 'object' },
        },
      },
    },
  },
});

export const IndustryAccountPaths = {
  '/api/superadmin/industry-account-categories': {
    post: {
      ...auth,
      tags: ['SuperAdmin Industry Account Categories'],
      summary: 'Create industry account category',
      parameters: [language],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: categoryBody } },
      },
      responses: {
        201: response('Industry account category created successfully'),
        ...errors,
      },
    },
    get: {
      ...auth,
      tags: ['SuperAdmin Industry Account Categories'],
      summary: 'List industry account categories',
      parameters: [
        ...commonListParams,
        {
          in: 'query',
          name: 'categoryType',
          schema: { type: 'string' },
        },
        {
          in: 'query',
          name: 'parentId',
          schema: { type: 'string', format: 'uuid' },
        },
      ],
      responses: {
        200: response('Industry account categories retrieved successfully'),
        ...errors,
      },
    },
  },
  '/api/superadmin/industry-account-categories/{id}': {
    get: {
      ...auth,
      tags: ['SuperAdmin Industry Account Categories'],
      summary: 'Get industry account category',
      parameters: [language, id],
      responses: { 200: response('Category retrieved'), ...errors },
    },
    put: {
      ...auth,
      tags: ['SuperAdmin Industry Account Categories'],
      summary: 'Update industry account category',
      parameters: [language, id],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: categoryBody } },
      },
      responses: { 200: response('Category updated'), ...errors },
    },
    delete: {
      ...auth,
      tags: ['SuperAdmin Industry Account Categories'],
      summary: 'Delete an empty industry account category',
      parameters: [id],
      responses: { 200: response('Category deleted'), ...errors },
    },
  },
  '/api/superadmin/industry-accounts': {
    post: {
      ...auth,
      tags: ['SuperAdmin Industry Accounts'],
      summary: 'Create industry account',
      parameters: [language],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: accountBody } },
      },
      responses: {
        201: response('Industry account created successfully'),
        ...errors,
      },
    },
    get: {
      ...auth,
      tags: ['SuperAdmin Industry Accounts'],
      summary: 'List industry accounts',
      parameters: commonListParams,
      responses: {
        200: response('Industry accounts retrieved successfully'),
        ...errors,
      },
    },
  },
  '/api/superadmin/industry-accounts/{id}': {
    get: {
      ...auth,
      tags: ['SuperAdmin Industry Accounts'],
      summary: 'Get industry account',
      parameters: [language, id],
      responses: { 200: response('Industry account retrieved'), ...errors },
    },
    put: {
      ...auth,
      tags: ['SuperAdmin Industry Accounts'],
      summary: 'Update industry account',
      parameters: [language, id],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: accountBody } },
      },
      responses: { 200: response('Industry account updated'), ...errors },
    },
    delete: {
      ...auth,
      tags: ['SuperAdmin Industry Accounts'],
      summary: 'Delete a leaf industry account',
      parameters: [id],
      responses: { 200: response('Industry account deleted'), ...errors },
    },
  },
  '/api/domain/industry-accounts': {
    get: {
      ...auth,
      tags: ['Domain Industry Accounts'],
      summary: 'List global industry account templates',
      description:
        'Read-only Domain access to IndustryAccount templates managed by SuperAdmin.',
      parameters: commonListParams,
      responses: {
        200: response('Industry accounts retrieved successfully'),
        ...errors,
      },
    },
  },
  '/api/user/industry-accounts': {
    get: {
      ...auth,
      tags: ['User Industry Accounts'],
      summary: 'List global industry account templates',
      description:
        'Read-only User access to IndustryAccount templates managed by SuperAdmin. Requires INDUSTRY_ACCOUNT READ permission.',
      parameters: [
        ...commonListParams,
        {
          in: 'query',
          name: 'categoryId',
          schema: { type: 'string', format: 'uuid' },
        },
        {
          in: 'query',
          name: 'parentId',
          schema: { type: 'string', format: 'uuid' },
        },
        {
          in: 'query',
          name: 'isPostingAllowed',
          schema: { type: 'boolean' },
        },
        { in: 'query', name: 'isCashOrBank', schema: { type: 'boolean' } },
      ],
      responses: {
        200: response('Industry accounts retrieved successfully'),
        ...errors,
      },
    },
  },
  '/api/domain/industry-account-categories': {
    get: {
      ...auth,
      tags: ['Domain Industry Account Categories'],
      summary: 'List global industry account category templates',
      description:
        'Read-only Domain access to IndustryAccountCategory templates managed by SuperAdmin.',
      parameters: commonListParams,
      responses: {
        200: response('Industry account categories retrieved successfully'),
        ...errors,
      },
    },
  },
  '/api/user/industry-account-categories': {
    get: {
      ...auth,
      tags: ['User Industry Account Categories'],
      summary: 'List global industry account category templates',
      description:
        'Read-only User access to IndustryAccountCategory templates managed by SuperAdmin. Requires INDUSTRY_ACCOUNT_CATEGORY READ permission.',
      parameters: commonListParams,
      responses: {
        200: response('Industry account categories retrieved successfully'),
        ...errors,
      },
    },
  },
};
