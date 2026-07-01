export const AccountPaths = {
  '/api/domain/accounts': {
    post: {
      tags: ['Domain Accounts'],
      summary: 'Create account',
      security: [
        {
          bearerAuth: [],
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/AccountCreateBody' },
            example: {
              name: {
                en: 'Cash In Hand',
              },
              description: 'Petty cash account',
              accountCategoryId: '<leaf-category-uuid>',
              parentId: '<parent-account-uuid>',
              currencyId: '<currency-uuid>',
              costCenterId: '<cost-center-uuid>',
              projectId: '<project-uuid>',
              isCashOrBank: true,
              isPostingAllowed: true,
              isSystem: false,
              isActive: true,
              sortOrder: 0,
              status: 'ACTIVE',
            },
          },
        },
      },
      responses: {
        '201': {
          description: 'Account created',
          content: {
            'application/json': {
              example: {
                success: true,
                message: 'Account created successfully',
                data: {
                  id: '1b1e6637-47af-4ba8-a98c-f76cd6b01b07',
                  name: {
                    en: 'Cash In Hand 1782794791',
                  },
                  code: 'CASH_IN_HAND_1782794791',
                  searchText: 'cash in hand 1782794791 cash_in_hand_1782794791',
                  description: 'Petty cash account',
                  parentId: null,
                  path: '1b1e6637-47af-4ba8-a98c-f76cd6b01b07',
                  level: 0,
                  childrenCount: 0,
                  accountCategoryId: '21c70e4b-67cb-4dd7-baa0-7b40ce2ffb99',
                  currencyId: null,
                  isCashOrBank: true,
                  isPostingAllowed: true,
                  isSystem: false,
                  isActive: true,
                  sortOrder: 0,
                  costCenterId: null,
                  projectId: null,
                  domainId: '32549b13-9fb7-44da-8f70-d943d997f956',
                  adminId: '1da16956-db58-4216-81f1-30ca54876913',
                  status: 'ACTIVE',
                  isDeleted: false,
                  createdAt: '2026-06-30T04:46:32.008Z',
                  updatedAt: '2026-06-30T04:46:32.008Z',
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
      tags: ['Domain Accounts'],
      summary: 'List accounts',
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
          name: 'accountCategoryId',
          schema: {
            type: 'string',
            format: 'uuid',
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
        {
          in: 'query',
          name: 'isCashOrBank',
          schema: {
            type: 'boolean',
          },
        },
      ],
      responses: {
        '200': {
          description: 'Accounts retrieved',
          content: {
            'application/json': {
              example: {
                success: true,
                message: 'Accounts retrieved successfully',
                pagination: {
                  currentCount: 1,
                  totalCount: 1,
                  offset: 0,
                  limit: 10,
                },
                data: [
                  {
                    id: '1b1e6637-47af-4ba8-a98c-f76cd6b01b07',
                    name: 'Cash In Hand 1782794791',
                    code: 'CASH_IN_HAND_1782794791',
                    searchText:
                      'cash in hand 1782794791 cash_in_hand_1782794791',
                    description: 'Petty cash account',
                    parentId: null,
                    path: '1b1e6637-47af-4ba8-a98c-f76cd6b01b07',
                    level: 0,
                    childrenCount: 0,
                    accountCategoryId: '21c70e4b-67cb-4dd7-baa0-7b40ce2ffb99',
                    currencyId: null,
                    isCashOrBank: true,
                    isPostingAllowed: true,
                    isSystem: false,
                    isActive: true,
                    sortOrder: 0,
                    costCenterId: null,
                    projectId: null,
                    domainId: '32549b13-9fb7-44da-8f70-d943d997f956',
                    adminId: '1da16956-db58-4216-81f1-30ca54876913',
                    status: 'ACTIVE',
                    isDeleted: false,
                    createdAt: '2026-06-30T04:46:32.008Z',
                    updatedAt: '2026-06-30T04:46:32.008Z',
                    parent: null,
                    accountCategory: {
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
                    currency: null,
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
  '/api/domain/accounts/{id}': {
    get: {
      tags: ['Domain Accounts'],
      summary: 'Get account by id',
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
          description: 'Account ID',
        },
      ],
      responses: {
        '200': {
          description: 'Account retrieved',
          content: {
            'application/json': {
              example: {
                success: true,
                message: 'Account retrieved successfully',
                data: {
                  id: '1b1e6637-47af-4ba8-a98c-f76cd6b01b07',
                  name: {
                    en: 'Cash In Hand 1782794791',
                  },
                  code: 'CASH_IN_HAND_1782794791',
                  searchText: 'cash in hand 1782794791 cash_in_hand_1782794791',
                  description: 'Petty cash account',
                  parentId: null,
                  path: '1b1e6637-47af-4ba8-a98c-f76cd6b01b07',
                  level: 0,
                  childrenCount: 0,
                  accountCategoryId: '21c70e4b-67cb-4dd7-baa0-7b40ce2ffb99',
                  currencyId: null,
                  isCashOrBank: true,
                  isPostingAllowed: true,
                  isSystem: false,
                  isActive: true,
                  sortOrder: 0,
                  costCenterId: null,
                  projectId: null,
                  domainId: '32549b13-9fb7-44da-8f70-d943d997f956',
                  adminId: '1da16956-db58-4216-81f1-30ca54876913',
                  status: 'ACTIVE',
                  isDeleted: false,
                  createdAt: '2026-06-30T04:46:32.008Z',
                  updatedAt: '2026-06-30T04:46:32.008Z',
                  parent: null,
                  accountCategory: {
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
                  currency: null,
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
      tags: ['Domain Accounts'],
      summary: 'Update account',
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
          description: 'Account ID',
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/AccountUpdateBody' },
            example: {
              name: {
                en: 'Cash In Hand',
              },
              description: 'Updated petty cash',
              accountCategoryId: '<leaf-category-uuid>',
              currencyId: '<currency-uuid>',
              costCenterId: '<cost-center-uuid>',
              projectId: '<project-uuid>',
              isCashOrBank: true,
              isPostingAllowed: true,
              isSystem: false,
              isActive: true,
              sortOrder: 0,
              status: 'ACTIVE',
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Account updated',
          content: {
            'application/json': {
              example: {
                success: true,
                message: 'Account updated successfully',
                data: {
                  id: '1b1e6637-47af-4ba8-a98c-f76cd6b01b07',
                  name: {
                    en: 'Cash In Hand 1782794791',
                  },
                  code: 'CASH_IN_HAND_1782794791',
                  searchText: 'cash in hand 1782794791 cash_in_hand_1782794791',
                  description: 'Updated petty cash',
                  parentId: null,
                  path: '1b1e6637-47af-4ba8-a98c-f76cd6b01b07',
                  level: 0,
                  childrenCount: 0,
                  accountCategoryId: '21c70e4b-67cb-4dd7-baa0-7b40ce2ffb99',
                  currencyId: null,
                  isCashOrBank: true,
                  isPostingAllowed: true,
                  isSystem: false,
                  isActive: true,
                  sortOrder: 0,
                  costCenterId: null,
                  projectId: null,
                  domainId: '32549b13-9fb7-44da-8f70-d943d997f956',
                  adminId: '1da16956-db58-4216-81f1-30ca54876913',
                  status: 'ACTIVE',
                  isDeleted: false,
                  createdAt: '2026-06-30T04:46:32.008Z',
                  updatedAt: '2026-06-30T04:46:32.125Z',
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
      tags: ['Domain Accounts'],
      summary: 'Delete account',
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
          description: 'Account ID',
        },
      ],
      responses: {
        '200': {
          description: 'Account deleted',
          content: {
            'application/json': {
              example: {
                success: true,
                message: 'Account deleted successfully',
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
  '/api/user/accounts': {
    post: {
      tags: ['User Accounts'],
      summary: 'Create account',
      security: [
        {
          bearerAuth: [],
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/AccountCreateBody' },
            example: {
              name: {
                en: 'Cash In Hand',
              },
              description: 'Petty cash account',
              accountCategoryId: '<leaf-category-uuid>',
              parentId: '<parent-account-uuid>',
              currencyId: '<currency-uuid>',
              costCenterId: '<cost-center-uuid>',
              projectId: '<project-uuid>',
              isCashOrBank: true,
              isPostingAllowed: true,
              isSystem: false,
              isActive: true,
              sortOrder: 0,
              status: 'ACTIVE',
            },
          },
        },
      },
      responses: {
        '201': {
          description: 'Account created',
          content: {
            'application/json': {
              example: {
                success: true,
                message: 'Account created successfully',
                data: {
                  id: '1b1e6637-47af-4ba8-a98c-f76cd6b01b07',
                  name: {
                    en: 'Cash In Hand 1782794791',
                  },
                  code: 'CASH_IN_HAND_1782794791',
                  searchText: 'cash in hand 1782794791 cash_in_hand_1782794791',
                  description: 'Petty cash account',
                  parentId: null,
                  path: '1b1e6637-47af-4ba8-a98c-f76cd6b01b07',
                  level: 0,
                  childrenCount: 0,
                  accountCategoryId: '21c70e4b-67cb-4dd7-baa0-7b40ce2ffb99',
                  currencyId: null,
                  isCashOrBank: true,
                  isPostingAllowed: true,
                  isSystem: false,
                  isActive: true,
                  sortOrder: 0,
                  costCenterId: null,
                  projectId: null,
                  domainId: '32549b13-9fb7-44da-8f70-d943d997f956',
                  adminId: '1da16956-db58-4216-81f1-30ca54876913',
                  status: 'ACTIVE',
                  isDeleted: false,
                  createdAt: '2026-06-30T04:46:32.008Z',
                  updatedAt: '2026-06-30T04:46:32.008Z',
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
      tags: ['User Accounts'],
      summary: 'List accounts',
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
          name: 'accountCategoryId',
          schema: {
            type: 'string',
            format: 'uuid',
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
        {
          in: 'query',
          name: 'isCashOrBank',
          schema: {
            type: 'boolean',
          },
        },
      ],
      responses: {
        '200': {
          description: 'Accounts retrieved',
          content: {
            'application/json': {
              example: {
                success: true,
                message: 'Accounts retrieved successfully',
                pagination: {
                  currentCount: 1,
                  totalCount: 1,
                  offset: 0,
                  limit: 10,
                },
                data: [
                  {
                    id: '1b1e6637-47af-4ba8-a98c-f76cd6b01b07',
                    name: 'Cash In Hand 1782794791',
                    code: 'CASH_IN_HAND_1782794791',
                    searchText:
                      'cash in hand 1782794791 cash_in_hand_1782794791',
                    description: 'Petty cash account',
                    parentId: null,
                    path: '1b1e6637-47af-4ba8-a98c-f76cd6b01b07',
                    level: 0,
                    childrenCount: 0,
                    accountCategoryId: '21c70e4b-67cb-4dd7-baa0-7b40ce2ffb99',
                    currencyId: null,
                    isCashOrBank: true,
                    isPostingAllowed: true,
                    isSystem: false,
                    isActive: true,
                    sortOrder: 0,
                    costCenterId: null,
                    projectId: null,
                    domainId: '32549b13-9fb7-44da-8f70-d943d997f956',
                    adminId: '1da16956-db58-4216-81f1-30ca54876913',
                    status: 'ACTIVE',
                    isDeleted: false,
                    createdAt: '2026-06-30T04:46:32.008Z',
                    updatedAt: '2026-06-30T04:46:32.008Z',
                    parent: null,
                    accountCategory: {
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
                    currency: null,
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
  '/api/user/accounts/{id}': {
    get: {
      tags: ['User Accounts'],
      summary: 'Get account by id',
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
          description: 'Account ID',
        },
      ],
      responses: {
        '200': {
          description: 'Account retrieved',
          content: {
            'application/json': {
              example: {
                success: true,
                message: 'Account retrieved successfully',
                data: {
                  id: '1b1e6637-47af-4ba8-a98c-f76cd6b01b07',
                  name: {
                    en: 'Cash In Hand 1782794791',
                  },
                  code: 'CASH_IN_HAND_1782794791',
                  searchText: 'cash in hand 1782794791 cash_in_hand_1782794791',
                  description: 'Petty cash account',
                  parentId: null,
                  path: '1b1e6637-47af-4ba8-a98c-f76cd6b01b07',
                  level: 0,
                  childrenCount: 0,
                  accountCategoryId: '21c70e4b-67cb-4dd7-baa0-7b40ce2ffb99',
                  currencyId: null,
                  isCashOrBank: true,
                  isPostingAllowed: true,
                  isSystem: false,
                  isActive: true,
                  sortOrder: 0,
                  costCenterId: null,
                  projectId: null,
                  domainId: '32549b13-9fb7-44da-8f70-d943d997f956',
                  adminId: '1da16956-db58-4216-81f1-30ca54876913',
                  status: 'ACTIVE',
                  isDeleted: false,
                  createdAt: '2026-06-30T04:46:32.008Z',
                  updatedAt: '2026-06-30T04:46:32.008Z',
                  parent: null,
                  accountCategory: {
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
                  currency: null,
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
      tags: ['User Accounts'],
      summary: 'Update account',
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
          description: 'Account ID',
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/AccountUpdateBody' },
            example: {
              name: {
                en: 'Cash In Hand',
              },
              description: 'Updated petty cash',
              accountCategoryId: '<leaf-category-uuid>',
              currencyId: '<currency-uuid>',
              costCenterId: '<cost-center-uuid>',
              projectId: '<project-uuid>',
              isCashOrBank: true,
              isPostingAllowed: true,
              isSystem: false,
              isActive: true,
              sortOrder: 0,
              status: 'ACTIVE',
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Account updated',
          content: {
            'application/json': {
              example: {
                success: true,
                message: 'Account updated successfully',
                data: {
                  id: '1b1e6637-47af-4ba8-a98c-f76cd6b01b07',
                  name: {
                    en: 'Cash In Hand 1782794791',
                  },
                  code: 'CASH_IN_HAND_1782794791',
                  searchText: 'cash in hand 1782794791 cash_in_hand_1782794791',
                  description: 'Updated petty cash',
                  parentId: null,
                  path: '1b1e6637-47af-4ba8-a98c-f76cd6b01b07',
                  level: 0,
                  childrenCount: 0,
                  accountCategoryId: '21c70e4b-67cb-4dd7-baa0-7b40ce2ffb99',
                  currencyId: null,
                  isCashOrBank: true,
                  isPostingAllowed: true,
                  isSystem: false,
                  isActive: true,
                  sortOrder: 0,
                  costCenterId: null,
                  projectId: null,
                  domainId: '32549b13-9fb7-44da-8f70-d943d997f956',
                  adminId: '1da16956-db58-4216-81f1-30ca54876913',
                  status: 'ACTIVE',
                  isDeleted: false,
                  createdAt: '2026-06-30T04:46:32.008Z',
                  updatedAt: '2026-06-30T04:46:32.125Z',
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
      tags: ['User Accounts'],
      summary: 'Delete account',
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
          description: 'Account ID',
        },
      ],
      responses: {
        '200': {
          description: 'Account deleted',
          content: {
            'application/json': {
              example: {
                success: true,
                message: 'Account deleted successfully',
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
