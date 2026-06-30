export const AccountCategorySchemas = {
  AccountCategoryObject: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        example: '21c70e4b-67cb-4dd7-baa0-7b40ce2ffb99',
      },
      name: {
        type: 'object',
        example: {
          en: 'Cash And Bank 1782794791',
        },
      },
      code: {
        type: 'string',
        example: 'CASH_AND_BANK_1782794791',
      },
      searchText: {
        type: 'string',
        example: 'cash and bank 1782794791 cash_and_bank_1782794791',
      },
      categoryType: {
        type: 'string',
        example: 'ASSET',
      },
      normalBalance: {
        type: 'string',
        example: 'DEBIT',
      },
      parentId: {
        type: 'string',
        nullable: true,
        example: null,
      },
      path: {
        type: 'string',
        format: 'uuid',
        example: '21c70e4b-67cb-4dd7-baa0-7b40ce2ffb99',
      },
      level: {
        type: 'integer',
        example: 0,
      },
      childrenCount: {
        type: 'integer',
        example: 0,
      },
      sortOrder: {
        type: 'integer',
        example: 0,
      },
      isPostingAllowed: {
        type: 'boolean',
        example: true,
      },
      isSystem: {
        type: 'boolean',
        example: false,
      },
      domainId: {
        type: 'string',
        format: 'uuid',
        example: '32549b13-9fb7-44da-8f70-d943d997f956',
      },
      adminId: {
        type: 'string',
        format: 'uuid',
        example: '1da16956-db58-4216-81f1-30ca54876913',
      },
      status: {
        type: 'string',
        example: 'ACTIVE',
      },
      isDeleted: {
        type: 'boolean',
        example: false,
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        example: '2026-06-30T04:46:31.872Z',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        example: '2026-06-30T04:46:31.872Z',
      },
    },
  },
};
