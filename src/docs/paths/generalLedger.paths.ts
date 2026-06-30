export const GeneralLedgerPaths = {
  '/api/domain/general-ledger': {
    get: {
      tags: ['Domain General Ledger'],
      summary: 'List general ledger entries',
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
          description: 'General ledger entries retrieved',
          content: {
            'application/json': {
              example: {
                success: true,
                message: 'General ledger entries retrieved successfully',
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
  '/api/domain/general-ledger/{id}': {
    get: {
      tags: ['Domain General Ledger'],
      summary: 'Get general ledger entry by id',
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
          description: 'General ledger ID',
        },
      ],
      responses: {
        '200': {
          description: 'General ledger entry retrieved',
          content: {
            'application/json': {
              example: {
                success: false,
                message: 'General ledger entry not found',
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
  '/api/user/general-ledger': {
    get: {
      tags: ['User General Ledger'],
      summary: 'List general ledger entries',
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
          description: 'General ledger entries retrieved',
          content: {
            'application/json': {
              example: {
                success: true,
                message: 'General ledger entries retrieved successfully',
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
  '/api/user/general-ledger/{id}': {
    get: {
      tags: ['User General Ledger'],
      summary: 'Get general ledger entry by id',
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
          description: 'General ledger ID',
        },
      ],
      responses: {
        '200': {
          description: 'General ledger entry retrieved',
          content: {
            'application/json': {
              example: {
                success: false,
                message: 'General ledger entry not found',
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
