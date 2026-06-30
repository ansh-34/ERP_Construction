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
                  currentCount: 0,
                  totalCount: 0,
                  offset: 0,
                  limit: 10,
                },
                data: [],
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
                success: false,
                message: 'Account balance not found',
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
                  currentCount: 0,
                  totalCount: 0,
                  offset: 0,
                  limit: 10,
                },
                data: [],
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
                success: false,
                message: 'Account balance not found',
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
