export const AccountSchemas = {
  AccountObject: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        example: '1b1e6637-47af-4ba8-a98c-f76cd6b01b07',
      },
      name: {
        type: 'object',
        example: {
          en: 'Cash In Hand 1782794791',
        },
      },
      code: {
        type: 'string',
        example: 'CASH_IN_HAND_1782794791',
      },
      searchText: {
        type: 'string',
        example: 'cash in hand 1782794791 cash_in_hand_1782794791',
      },
      description: {
        type: 'string',
        example: 'Petty cash account',
      },
      parentId: {
        type: 'string',
        nullable: true,
        example: null,
      },
      path: {
        type: 'string',
        format: 'uuid',
        example: '1b1e6637-47af-4ba8-a98c-f76cd6b01b07',
      },
      level: {
        type: 'integer',
        example: 0,
      },
      childrenCount: {
        type: 'integer',
        example: 0,
      },
      accountCategoryId: {
        type: 'string',
        format: 'uuid',
        example: '21c70e4b-67cb-4dd7-baa0-7b40ce2ffb99',
      },
      currencyId: {
        type: 'string',
        nullable: true,
        example: null,
      },
      isCashOrBank: {
        type: 'boolean',
        example: true,
      },
      isPostingAllowed: {
        type: 'boolean',
        example: true,
      },
      isSystem: {
        type: 'boolean',
        example: false,
      },
      isActive: {
        type: 'boolean',
        example: true,
      },
      sortOrder: {
        type: 'integer',
        example: 0,
      },
      costCenterId: {
        type: 'string',
        nullable: true,
        example: null,
      },
      projectId: {
        type: 'string',
        nullable: true,
        example: null,
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
        example: '2026-06-30T04:46:32.008Z',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        example: '2026-06-30T04:46:32.008Z',
      },
    },
  },
};
