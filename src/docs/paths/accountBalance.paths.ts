export const AccountBalancePaths = {
  '/api/domain/account-balances': {
    get: {
      tags: ['Domain Account Balances'],
      summary: 'List account balance entries',
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
          name: 'accountId',
          schema: {
            type: 'string',
            format: 'uuid',
          },
        },
        {
          in: 'query',
          name: 'fiscalYearId',
          schema: {
            type: 'string',
            format: 'uuid',
          },
        },
        {
          in: 'query',
          name: 'accountingPeriodId',
          schema: {
            type: 'string',
            format: 'uuid',
          },
        },
        {
          in: 'query',
          name: 'costCenterId',
          schema: {
            type: 'string',
            format: 'uuid',
          },
        },
        {
          in: 'query',
          name: 'projectId',
          schema: {
            type: 'string',
            format: 'uuid',
          },
        },
        {
          in: 'query',
          name: 'from',
          schema: {
            type: 'string',
            format: 'date',
          },
        },
        {
          in: 'query',
          name: 'to',
          schema: {
            type: 'string',
            format: 'date',
          },
        },
      ],
      responses: {
        '200': {
          description: 'Account balance entries retrieved',
          content: {
            'application/json': {
              example: {
                success: true,
                message: 'Account balances retrieved successfully',
                pagination: {
                  currentCount: 2,
                  totalCount: 2,
                  offset: 0,
                  limit: 10,
                },
                data: [
                  {
                    id: '50e5dcdf-82fb-4ec4-b618-98d1effec6b5',
                    accountId: '80b95f1c-7954-4265-961a-8aef4d63dfcc',
                    fiscalYearId: 'aaaaaaaa-0000-4000-8000-000000000001',
                    accountingPeriodId: 'aaaaaaaa-0000-4000-8000-0000000000a2',
                    costCenterId: '89ad423e-9823-471b-8f4e-5bc1f7bac965',
                    projectId: null,
                    openingDebit: '10000',
                    openingCredit: '4000',
                    periodDebit: '7500',
                    periodCredit: '2500',
                    closingDebit: '17500',
                    closingCredit: '6500',
                    lastJournalEntryId: null,
                    adminId: '1da16956-db58-4216-81f1-30ca54876913',
                    domainId: '32549b13-9fb7-44da-8f70-d943d997f956',
                    createdAt: '2026-06-30T09:12:26.503Z',
                    updatedAt: '2026-06-30T09:12:26.503Z',
                    account: {
                      id: '80b95f1c-7954-4265-961a-8aef4d63dfcc',
                      name: 'Dummy Ledger Account',
                      code: 'DUMMY_LEDGER_ACCOUNT',
                      searchText: 'dummy ledger account dummy_ledger_account',
                      description: null,
                      parentId: null,
                      path: '80b95f1c-7954-4265-961a-8aef4d63dfcc',
                      level: 0,
                      childrenCount: 0,
                      accountCategoryId: '8cea0235-26a8-4470-b64f-dd8c4cdce33b',
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
                      createdAt: '2026-06-30T09:12:26.373Z',
                      updatedAt: '2026-06-30T09:12:26.373Z',
                    },
                  },
                  {
                    id: 'eb9642ad-9fe7-418d-99c6-46ee7a49e89e',
                    accountId: '80b95f1c-7954-4265-961a-8aef4d63dfcc',
                    fiscalYearId: 'aaaaaaaa-0000-4000-8000-000000000001',
                    accountingPeriodId: 'aaaaaaaa-0000-4000-8000-0000000000a1',
                    costCenterId: '89ad423e-9823-471b-8f4e-5bc1f7bac965',
                    projectId: null,
                    openingDebit: '0',
                    openingCredit: '0',
                    periodDebit: '10000',
                    periodCredit: '4000',
                    closingDebit: '10000',
                    closingCredit: '4000',
                    lastJournalEntryId: null,
                    adminId: '1da16956-db58-4216-81f1-30ca54876913',
                    domainId: '32549b13-9fb7-44da-8f70-d943d997f956',
                    createdAt: '2026-06-30T09:12:26.493Z',
                    updatedAt: '2026-06-30T09:12:26.493Z',
                    account: {
                      id: '80b95f1c-7954-4265-961a-8aef4d63dfcc',
                      name: 'Dummy Ledger Account',
                      code: 'DUMMY_LEDGER_ACCOUNT',
                      searchText: 'dummy ledger account dummy_ledger_account',
                      description: null,
                      parentId: null,
                      path: '80b95f1c-7954-4265-961a-8aef4d63dfcc',
                      level: 0,
                      childrenCount: 0,
                      accountCategoryId: '8cea0235-26a8-4470-b64f-dd8c4cdce33b',
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
                      createdAt: '2026-06-30T09:12:26.373Z',
                      updatedAt: '2026-06-30T09:12:26.373Z',
                    },
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
  '/api/domain/account-balances/{id}': {
    get: {
      tags: ['Domain Account Balances'],
      summary: 'Get account balance entry by id',
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
          description: 'Account balance ID',
        },
      ],
      responses: {
        '200': {
          description: 'Account balance entry retrieved',
          content: {
            'application/json': {
              example: {
                success: true,
                message: 'Account balance retrieved successfully',
                data: {
                  id: '50e5dcdf-82fb-4ec4-b618-98d1effec6b5',
                  accountId: '80b95f1c-7954-4265-961a-8aef4d63dfcc',
                  fiscalYearId: 'aaaaaaaa-0000-4000-8000-000000000001',
                  accountingPeriodId: 'aaaaaaaa-0000-4000-8000-0000000000a2',
                  costCenterId: '89ad423e-9823-471b-8f4e-5bc1f7bac965',
                  projectId: null,
                  openingDebit: '10000',
                  openingCredit: '4000',
                  periodDebit: '7500',
                  periodCredit: '2500',
                  closingDebit: '17500',
                  closingCredit: '6500',
                  lastJournalEntryId: null,
                  adminId: '1da16956-db58-4216-81f1-30ca54876913',
                  domainId: '32549b13-9fb7-44da-8f70-d943d997f956',
                  createdAt: '2026-06-30T09:12:26.503Z',
                  updatedAt: '2026-06-30T09:12:26.503Z',
                  account: {
                    id: '80b95f1c-7954-4265-961a-8aef4d63dfcc',
                    name: {
                      en: 'Dummy Ledger Account',
                    },
                    code: 'DUMMY_LEDGER_ACCOUNT',
                    searchText: 'dummy ledger account dummy_ledger_account',
                    description: null,
                    parentId: null,
                    path: '80b95f1c-7954-4265-961a-8aef4d63dfcc',
                    level: 0,
                    childrenCount: 0,
                    accountCategoryId: '8cea0235-26a8-4470-b64f-dd8c4cdce33b',
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
                    createdAt: '2026-06-30T09:12:26.373Z',
                    updatedAt: '2026-06-30T09:12:26.373Z',
                  },
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
  },
  '/api/user/account-balances': {
    get: {
      tags: ['User Account Balances'],
      summary: 'List account balance entries',
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
          name: 'accountId',
          schema: {
            type: 'string',
            format: 'uuid',
          },
        },
        {
          in: 'query',
          name: 'fiscalYearId',
          schema: {
            type: 'string',
            format: 'uuid',
          },
        },
        {
          in: 'query',
          name: 'accountingPeriodId',
          schema: {
            type: 'string',
            format: 'uuid',
          },
        },
        {
          in: 'query',
          name: 'costCenterId',
          schema: {
            type: 'string',
            format: 'uuid',
          },
        },
        {
          in: 'query',
          name: 'projectId',
          schema: {
            type: 'string',
            format: 'uuid',
          },
        },
        {
          in: 'query',
          name: 'from',
          schema: {
            type: 'string',
            format: 'date',
          },
        },
        {
          in: 'query',
          name: 'to',
          schema: {
            type: 'string',
            format: 'date',
          },
        },
      ],
      responses: {
        '200': {
          description: 'Account balance entries retrieved',
          content: {
            'application/json': {
              example: {
                success: true,
                message: 'Account balances retrieved successfully',
                pagination: {
                  currentCount: 2,
                  totalCount: 2,
                  offset: 0,
                  limit: 10,
                },
                data: [
                  {
                    id: '50e5dcdf-82fb-4ec4-b618-98d1effec6b5',
                    accountId: '80b95f1c-7954-4265-961a-8aef4d63dfcc',
                    fiscalYearId: 'aaaaaaaa-0000-4000-8000-000000000001',
                    accountingPeriodId: 'aaaaaaaa-0000-4000-8000-0000000000a2',
                    costCenterId: '89ad423e-9823-471b-8f4e-5bc1f7bac965',
                    projectId: null,
                    openingDebit: '10000',
                    openingCredit: '4000',
                    periodDebit: '7500',
                    periodCredit: '2500',
                    closingDebit: '17500',
                    closingCredit: '6500',
                    lastJournalEntryId: null,
                    adminId: '1da16956-db58-4216-81f1-30ca54876913',
                    domainId: '32549b13-9fb7-44da-8f70-d943d997f956',
                    createdAt: '2026-06-30T09:12:26.503Z',
                    updatedAt: '2026-06-30T09:12:26.503Z',
                    account: {
                      id: '80b95f1c-7954-4265-961a-8aef4d63dfcc',
                      name: 'Dummy Ledger Account',
                      code: 'DUMMY_LEDGER_ACCOUNT',
                      searchText: 'dummy ledger account dummy_ledger_account',
                      description: null,
                      parentId: null,
                      path: '80b95f1c-7954-4265-961a-8aef4d63dfcc',
                      level: 0,
                      childrenCount: 0,
                      accountCategoryId: '8cea0235-26a8-4470-b64f-dd8c4cdce33b',
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
                      createdAt: '2026-06-30T09:12:26.373Z',
                      updatedAt: '2026-06-30T09:12:26.373Z',
                    },
                  },
                  {
                    id: 'eb9642ad-9fe7-418d-99c6-46ee7a49e89e',
                    accountId: '80b95f1c-7954-4265-961a-8aef4d63dfcc',
                    fiscalYearId: 'aaaaaaaa-0000-4000-8000-000000000001',
                    accountingPeriodId: 'aaaaaaaa-0000-4000-8000-0000000000a1',
                    costCenterId: '89ad423e-9823-471b-8f4e-5bc1f7bac965',
                    projectId: null,
                    openingDebit: '0',
                    openingCredit: '0',
                    periodDebit: '10000',
                    periodCredit: '4000',
                    closingDebit: '10000',
                    closingCredit: '4000',
                    lastJournalEntryId: null,
                    adminId: '1da16956-db58-4216-81f1-30ca54876913',
                    domainId: '32549b13-9fb7-44da-8f70-d943d997f956',
                    createdAt: '2026-06-30T09:12:26.493Z',
                    updatedAt: '2026-06-30T09:12:26.493Z',
                    account: {
                      id: '80b95f1c-7954-4265-961a-8aef4d63dfcc',
                      name: 'Dummy Ledger Account',
                      code: 'DUMMY_LEDGER_ACCOUNT',
                      searchText: 'dummy ledger account dummy_ledger_account',
                      description: null,
                      parentId: null,
                      path: '80b95f1c-7954-4265-961a-8aef4d63dfcc',
                      level: 0,
                      childrenCount: 0,
                      accountCategoryId: '8cea0235-26a8-4470-b64f-dd8c4cdce33b',
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
                      createdAt: '2026-06-30T09:12:26.373Z',
                      updatedAt: '2026-06-30T09:12:26.373Z',
                    },
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
  '/api/user/account-balances/{id}': {
    get: {
      tags: ['User Account Balances'],
      summary: 'Get account balance entry by id',
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
          description: 'Account balance ID',
        },
      ],
      responses: {
        '200': {
          description: 'Account balance entry retrieved',
          content: {
            'application/json': {
              example: {
                success: true,
                message: 'Account balance retrieved successfully',
                data: {
                  id: '50e5dcdf-82fb-4ec4-b618-98d1effec6b5',
                  accountId: '80b95f1c-7954-4265-961a-8aef4d63dfcc',
                  fiscalYearId: 'aaaaaaaa-0000-4000-8000-000000000001',
                  accountingPeriodId: 'aaaaaaaa-0000-4000-8000-0000000000a2',
                  costCenterId: '89ad423e-9823-471b-8f4e-5bc1f7bac965',
                  projectId: null,
                  openingDebit: '10000',
                  openingCredit: '4000',
                  periodDebit: '7500',
                  periodCredit: '2500',
                  closingDebit: '17500',
                  closingCredit: '6500',
                  lastJournalEntryId: null,
                  adminId: '1da16956-db58-4216-81f1-30ca54876913',
                  domainId: '32549b13-9fb7-44da-8f70-d943d997f956',
                  createdAt: '2026-06-30T09:12:26.503Z',
                  updatedAt: '2026-06-30T09:12:26.503Z',
                  account: {
                    id: '80b95f1c-7954-4265-961a-8aef4d63dfcc',
                    name: {
                      en: 'Dummy Ledger Account',
                    },
                    code: 'DUMMY_LEDGER_ACCOUNT',
                    searchText: 'dummy ledger account dummy_ledger_account',
                    description: null,
                    parentId: null,
                    path: '80b95f1c-7954-4265-961a-8aef4d63dfcc',
                    level: 0,
                    childrenCount: 0,
                    accountCategoryId: '8cea0235-26a8-4470-b64f-dd8c4cdce33b',
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
                    createdAt: '2026-06-30T09:12:26.373Z',
                    updatedAt: '2026-06-30T09:12:26.373Z',
                  },
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
  },
};
