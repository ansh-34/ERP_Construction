export const AccountCategoryPaths = {
  '/api/domain/account-categories': {
    post: {
      tags: ['Domain Account Categories'],
      summary: 'Create account category',
      security: [
        {
          bearerAuth: [],
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            example: {
              name: {
                en: 'Cash And Bank',
              },
              categoryType: 'ASSET',
              normalBalance: 'DEBIT',
              isPostingAllowed: true,
            },
          },
        },
      },
      responses: {
        '201': {
          description: 'Account category created',
          content: {
            'application/json': {
              example: {
                success: true,
                message: 'Account category created successfully',
                data: {
                  id: '21c70e4b-67cb-4dd7-baa0-7b40ce2ffb99',
                  name: {
                    en: 'Cash And Bank 1782794791',
                  },
                  code: 'CASH_AND_BANK_1782794791',
                  searchText:
                    'cash and bank 1782794791 cash_and_bank_1782794791',
                  categoryType: 'ASSET',
                  normalBalance: 'DEBIT',
                  parentId: null,
                  path: '21c70e4b-67cb-4dd7-baa0-7b40ce2ffb99',
                  level: 0,
                  childrenCount: 0,
                  sortOrder: 0,
                  isPostingAllowed: true,
                  isSystem: false,
                  domainId: '32549b13-9fb7-44da-8f70-d943d997f956',
                  adminId: '1da16956-db58-4216-81f1-30ca54876913',
                  status: 'ACTIVE',
                  isDeleted: false,
                  createdAt: '2026-06-30T04:46:31.872Z',
                  updatedAt: '2026-06-30T04:46:31.872Z',
                },
              },
            },
          },
        },
        '400': {
          description: 'Bad Request',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '401': {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '403': {
          description: 'Forbidden',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '404': {
          description: 'Not Found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '500': {
          description: 'Server Error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
      },
    },
    get: {
      tags: ['Domain Account Categories'],
      summary: 'List account categorys',
      security: [
        {
          bearerAuth: [],
        },
      ],
      parameters: [
        {
          in: 'query',
          name: 'limit',
          schema: {
            type: 'integer',
            default: 10,
          },
        },
        {
          in: 'query',
          name: 'offset',
          schema: {
            type: 'integer',
            default: 0,
          },
        },
        {
          in: 'query',
          name: 'status',
          schema: {
            type: 'string',
            enum: ['ACTIVE', 'INACTIVE'],
          },
        },
        {
          in: 'query',
          name: 'searchKey',
          schema: {
            type: 'string',
          },
        },
        {
          in: 'query',
          name: 'categoryType',
          schema: {
            type: 'string',
            enum: ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'],
          },
        },
        {
          in: 'query',
          name: 'parentId',
          schema: {
            type: 'string',
            format: 'uuid',
          },
        },
      ],
      responses: {
        '200': {
          description: 'Account categorys retrieved',
          content: {
            'application/json': {
              example: {
                success: true,
                message: 'Account categories retrieved successfully',
                pagination: {
                  currentCount: 2,
                  totalCount: 2,
                  offset: 0,
                  limit: 10,
                },
                data: [
                  {
                    id: '21c70e4b-67cb-4dd7-baa0-7b40ce2ffb99',
                    name: 'Cash And Bank 1782794791',
                    code: 'CASH_AND_BANK_1782794791',
                    searchText:
                      'cash and bank 1782794791 cash_and_bank_1782794791',
                    categoryType: 'ASSET',
                    normalBalance: 'DEBIT',
                    parentId: null,
                    path: '21c70e4b-67cb-4dd7-baa0-7b40ce2ffb99',
                    level: 0,
                    childrenCount: 0,
                    sortOrder: 0,
                    isPostingAllowed: true,
                    isSystem: false,
                    domainId: '32549b13-9fb7-44da-8f70-d943d997f956',
                    adminId: '1da16956-db58-4216-81f1-30ca54876913',
                    status: 'ACTIVE',
                    isDeleted: false,
                    createdAt: '2026-06-30T04:46:31.872Z',
                    updatedAt: '2026-06-30T04:46:31.872Z',
                    parent: null,
                  },
                  {
                    id: '0eb95ac7-9667-4ba8-8840-8322ae4872b9',
                    name: 'Current Assets 1782792745',
                    code: 'CURRENT_ASSETS_1782792745',
                    searchText:
                      'current assets 1782792745 current_assets_1782792745',
                    categoryType: 'ASSET',
                    normalBalance: 'DEBIT',
                    parentId: null,
                    path: '1',
                    level: 0,
                    childrenCount: 0,
                    sortOrder: 0,
                    isPostingAllowed: true,
                    isSystem: false,
                    domainId: '32549b13-9fb7-44da-8f70-d943d997f956',
                    adminId: '1da16956-db58-4216-81f1-30ca54876913',
                    status: 'ACTIVE',
                    isDeleted: false,
                    createdAt: '2026-06-30T04:12:25.034Z',
                    updatedAt: '2026-06-30T04:12:25.034Z',
                    parent: null,
                  },
                ],
              },
            },
          },
        },
        '400': {
          description: 'Bad Request',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '401': {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '403': {
          description: 'Forbidden',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '404': {
          description: 'Not Found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '500': {
          description: 'Server Error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
      },
    },
  },
  '/api/domain/account-categories/{id}': {
    get: {
      tags: ['Domain Account Categories'],
      summary: 'Get account category by id',
      security: [
        {
          bearerAuth: [],
        },
      ],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'string',
            format: 'uuid',
          },
          description: 'Account category ID',
        },
      ],
      responses: {
        '200': {
          description: 'Account category retrieved',
          content: {
            'application/json': {
              example: {
                success: true,
                message: 'Account category retrieved successfully',
                data: {
                  id: '21c70e4b-67cb-4dd7-baa0-7b40ce2ffb99',
                  name: {
                    en: 'Cash And Bank 1782794791',
                  },
                  code: 'CASH_AND_BANK_1782794791',
                  searchText:
                    'cash and bank 1782794791 cash_and_bank_1782794791',
                  categoryType: 'ASSET',
                  normalBalance: 'DEBIT',
                  parentId: null,
                  path: '21c70e4b-67cb-4dd7-baa0-7b40ce2ffb99',
                  level: 0,
                  childrenCount: 0,
                  sortOrder: 0,
                  isPostingAllowed: true,
                  isSystem: false,
                  domainId: '32549b13-9fb7-44da-8f70-d943d997f956',
                  adminId: '1da16956-db58-4216-81f1-30ca54876913',
                  status: 'ACTIVE',
                  isDeleted: false,
                  createdAt: '2026-06-30T04:46:31.872Z',
                  updatedAt: '2026-06-30T04:46:31.872Z',
                  parent: null,
                },
              },
            },
          },
        },
        '400': {
          description: 'Bad Request',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '401': {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '403': {
          description: 'Forbidden',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '404': {
          description: 'Not Found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '500': {
          description: 'Server Error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
      },
    },
    put: {
      tags: ['Domain Account Categories'],
      summary: 'Update account category',
      security: [
        {
          bearerAuth: [],
        },
      ],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'string',
            format: 'uuid',
          },
          description: 'Account category ID',
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            example: {
              name: {
                en: 'Cash And Bank',
              },
              status: 'ACTIVE',
              sortOrder: 5,
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Account category updated',
          content: {
            'application/json': {
              example: {
                success: true,
                message: 'Account category updated successfully',
                data: {
                  id: '21c70e4b-67cb-4dd7-baa0-7b40ce2ffb99',
                  name: {
                    en: 'Cash And Bank 1782794791',
                  },
                  code: 'CASH_AND_BANK_1782794791',
                  searchText:
                    'cash and bank 1782794791 cash_and_bank_1782794791',
                  categoryType: 'ASSET',
                  normalBalance: 'DEBIT',
                  parentId: null,
                  path: '21c70e4b-67cb-4dd7-baa0-7b40ce2ffb99',
                  level: 0,
                  childrenCount: 0,
                  sortOrder: 5,
                  isPostingAllowed: true,
                  isSystem: false,
                  domainId: '32549b13-9fb7-44da-8f70-d943d997f956',
                  adminId: '1da16956-db58-4216-81f1-30ca54876913',
                  status: 'ACTIVE',
                  isDeleted: false,
                  createdAt: '2026-06-30T04:46:31.872Z',
                  updatedAt: '2026-06-30T04:46:31.978Z',
                },
              },
            },
          },
        },
        '400': {
          description: 'Bad Request',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '401': {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '403': {
          description: 'Forbidden',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '404': {
          description: 'Not Found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '500': {
          description: 'Server Error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
      },
    },
    delete: {
      tags: ['Domain Account Categories'],
      summary: 'Delete account category',
      security: [
        {
          bearerAuth: [],
        },
      ],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'string',
            format: 'uuid',
          },
          description: 'Account category ID',
        },
      ],
      responses: {
        '200': {
          description: 'Account category deleted',
          content: {
            'application/json': {
              example: {
                success: true,
                message: 'Account category deleted successfully',
                data: null,
              },
            },
          },
        },
        '400': {
          description: 'Bad Request',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '401': {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '403': {
          description: 'Forbidden',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '404': {
          description: 'Not Found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '500': {
          description: 'Server Error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
      },
    },
  },
  '/api/user/account-categories': {
    post: {
      tags: ['User Account Categories'],
      summary: 'Create account category',
      security: [
        {
          bearerAuth: [],
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            example: {
              name: {
                en: 'Cash And Bank',
              },
              categoryType: 'ASSET',
              normalBalance: 'DEBIT',
              isPostingAllowed: true,
            },
          },
        },
      },
      responses: {
        '201': {
          description: 'Account category created',
          content: {
            'application/json': {
              example: {
                success: true,
                message: 'Account category created successfully',
                data: {
                  id: '21c70e4b-67cb-4dd7-baa0-7b40ce2ffb99',
                  name: {
                    en: 'Cash And Bank 1782794791',
                  },
                  code: 'CASH_AND_BANK_1782794791',
                  searchText:
                    'cash and bank 1782794791 cash_and_bank_1782794791',
                  categoryType: 'ASSET',
                  normalBalance: 'DEBIT',
                  parentId: null,
                  path: '21c70e4b-67cb-4dd7-baa0-7b40ce2ffb99',
                  level: 0,
                  childrenCount: 0,
                  sortOrder: 0,
                  isPostingAllowed: true,
                  isSystem: false,
                  domainId: '32549b13-9fb7-44da-8f70-d943d997f956',
                  adminId: '1da16956-db58-4216-81f1-30ca54876913',
                  status: 'ACTIVE',
                  isDeleted: false,
                  createdAt: '2026-06-30T04:46:31.872Z',
                  updatedAt: '2026-06-30T04:46:31.872Z',
                },
              },
            },
          },
        },
        '400': {
          description: 'Bad Request',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '401': {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '403': {
          description: 'Forbidden',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '404': {
          description: 'Not Found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '500': {
          description: 'Server Error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
      },
    },
    get: {
      tags: ['User Account Categories'],
      summary: 'List account categorys',
      security: [
        {
          bearerAuth: [],
        },
      ],
      parameters: [
        {
          in: 'query',
          name: 'limit',
          schema: {
            type: 'integer',
            default: 10,
          },
        },
        {
          in: 'query',
          name: 'offset',
          schema: {
            type: 'integer',
            default: 0,
          },
        },
        {
          in: 'query',
          name: 'status',
          schema: {
            type: 'string',
            enum: ['ACTIVE', 'INACTIVE'],
          },
        },
        {
          in: 'query',
          name: 'searchKey',
          schema: {
            type: 'string',
          },
        },
        {
          in: 'query',
          name: 'categoryType',
          schema: {
            type: 'string',
            enum: ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'],
          },
        },
        {
          in: 'query',
          name: 'parentId',
          schema: {
            type: 'string',
            format: 'uuid',
          },
        },
      ],
      responses: {
        '200': {
          description: 'Account categorys retrieved',
          content: {
            'application/json': {
              example: {
                success: true,
                message: 'Account categories retrieved successfully',
                pagination: {
                  currentCount: 2,
                  totalCount: 2,
                  offset: 0,
                  limit: 10,
                },
                data: [
                  {
                    id: '21c70e4b-67cb-4dd7-baa0-7b40ce2ffb99',
                    name: 'Cash And Bank 1782794791',
                    code: 'CASH_AND_BANK_1782794791',
                    searchText:
                      'cash and bank 1782794791 cash_and_bank_1782794791',
                    categoryType: 'ASSET',
                    normalBalance: 'DEBIT',
                    parentId: null,
                    path: '21c70e4b-67cb-4dd7-baa0-7b40ce2ffb99',
                    level: 0,
                    childrenCount: 0,
                    sortOrder: 0,
                    isPostingAllowed: true,
                    isSystem: false,
                    domainId: '32549b13-9fb7-44da-8f70-d943d997f956',
                    adminId: '1da16956-db58-4216-81f1-30ca54876913',
                    status: 'ACTIVE',
                    isDeleted: false,
                    createdAt: '2026-06-30T04:46:31.872Z',
                    updatedAt: '2026-06-30T04:46:31.872Z',
                    parent: null,
                  },
                  {
                    id: '0eb95ac7-9667-4ba8-8840-8322ae4872b9',
                    name: 'Current Assets 1782792745',
                    code: 'CURRENT_ASSETS_1782792745',
                    searchText:
                      'current assets 1782792745 current_assets_1782792745',
                    categoryType: 'ASSET',
                    normalBalance: 'DEBIT',
                    parentId: null,
                    path: '1',
                    level: 0,
                    childrenCount: 0,
                    sortOrder: 0,
                    isPostingAllowed: true,
                    isSystem: false,
                    domainId: '32549b13-9fb7-44da-8f70-d943d997f956',
                    adminId: '1da16956-db58-4216-81f1-30ca54876913',
                    status: 'ACTIVE',
                    isDeleted: false,
                    createdAt: '2026-06-30T04:12:25.034Z',
                    updatedAt: '2026-06-30T04:12:25.034Z',
                    parent: null,
                  },
                ],
              },
            },
          },
        },
        '400': {
          description: 'Bad Request',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '401': {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '403': {
          description: 'Forbidden',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '404': {
          description: 'Not Found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '500': {
          description: 'Server Error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
      },
    },
  },
  '/api/user/account-categories/{id}': {
    get: {
      tags: ['User Account Categories'],
      summary: 'Get account category by id',
      security: [
        {
          bearerAuth: [],
        },
      ],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'string',
            format: 'uuid',
          },
          description: 'Account category ID',
        },
      ],
      responses: {
        '200': {
          description: 'Account category retrieved',
          content: {
            'application/json': {
              example: {
                success: true,
                message: 'Account category retrieved successfully',
                data: {
                  id: '21c70e4b-67cb-4dd7-baa0-7b40ce2ffb99',
                  name: {
                    en: 'Cash And Bank 1782794791',
                  },
                  code: 'CASH_AND_BANK_1782794791',
                  searchText:
                    'cash and bank 1782794791 cash_and_bank_1782794791',
                  categoryType: 'ASSET',
                  normalBalance: 'DEBIT',
                  parentId: null,
                  path: '21c70e4b-67cb-4dd7-baa0-7b40ce2ffb99',
                  level: 0,
                  childrenCount: 0,
                  sortOrder: 0,
                  isPostingAllowed: true,
                  isSystem: false,
                  domainId: '32549b13-9fb7-44da-8f70-d943d997f956',
                  adminId: '1da16956-db58-4216-81f1-30ca54876913',
                  status: 'ACTIVE',
                  isDeleted: false,
                  createdAt: '2026-06-30T04:46:31.872Z',
                  updatedAt: '2026-06-30T04:46:31.872Z',
                  parent: null,
                },
              },
            },
          },
        },
        '400': {
          description: 'Bad Request',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '401': {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '403': {
          description: 'Forbidden',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '404': {
          description: 'Not Found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '500': {
          description: 'Server Error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
      },
    },
    put: {
      tags: ['User Account Categories'],
      summary: 'Update account category',
      security: [
        {
          bearerAuth: [],
        },
      ],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'string',
            format: 'uuid',
          },
          description: 'Account category ID',
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            example: {
              name: {
                en: 'Cash And Bank',
              },
              status: 'ACTIVE',
              sortOrder: 5,
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Account category updated',
          content: {
            'application/json': {
              example: {
                success: true,
                message: 'Account category updated successfully',
                data: {
                  id: '21c70e4b-67cb-4dd7-baa0-7b40ce2ffb99',
                  name: {
                    en: 'Cash And Bank 1782794791',
                  },
                  code: 'CASH_AND_BANK_1782794791',
                  searchText:
                    'cash and bank 1782794791 cash_and_bank_1782794791',
                  categoryType: 'ASSET',
                  normalBalance: 'DEBIT',
                  parentId: null,
                  path: '21c70e4b-67cb-4dd7-baa0-7b40ce2ffb99',
                  level: 0,
                  childrenCount: 0,
                  sortOrder: 5,
                  isPostingAllowed: true,
                  isSystem: false,
                  domainId: '32549b13-9fb7-44da-8f70-d943d997f956',
                  adminId: '1da16956-db58-4216-81f1-30ca54876913',
                  status: 'ACTIVE',
                  isDeleted: false,
                  createdAt: '2026-06-30T04:46:31.872Z',
                  updatedAt: '2026-06-30T04:46:31.978Z',
                },
              },
            },
          },
        },
        '400': {
          description: 'Bad Request',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '401': {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '403': {
          description: 'Forbidden',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '404': {
          description: 'Not Found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '500': {
          description: 'Server Error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
      },
    },
    delete: {
      tags: ['User Account Categories'],
      summary: 'Delete account category',
      security: [
        {
          bearerAuth: [],
        },
      ],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'string',
            format: 'uuid',
          },
          description: 'Account category ID',
        },
      ],
      responses: {
        '200': {
          description: 'Account category deleted',
          content: {
            'application/json': {
              example: {
                success: true,
                message: 'Account category deleted successfully',
                data: null,
              },
            },
          },
        },
        '400': {
          description: 'Bad Request',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '401': {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '403': {
          description: 'Forbidden',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '404': {
          description: 'Not Found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '500': {
          description: 'Server Error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
      },
    },
  },
};
