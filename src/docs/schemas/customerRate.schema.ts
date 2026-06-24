export const CustomerRateSchemas = {
  CustomerRateObject: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        example: 'b1c2d3e4-0001-0001-0001-000000000001',
      },
      customerId: {
        type: 'string',
        format: 'uuid',
        example: 'a339bac0-d4cc-4468-a755-20a46ed06599',
      },
      productId: {
        type: 'string',
        format: 'uuid',
        example: '33333333-3333-3333-3333-333333333301',
      },
      productGradeId: {
        type: 'string',
        format: 'uuid',
        example: '44444444-4444-4444-4444-444444444401',
      },
      rate: { type: 'number', example: 350 },
      currencyId: {
        type: 'string',
        format: 'uuid',
        example: 'cc000000-0000-0000-0000-000000000001',
      },
      uomId: {
        type: 'string',
        format: 'uuid',
        example: '55555555-5555-5555-5555-555555555501',
      },
      effectiveFrom: {
        type: 'string',
        format: 'date-time',
        example: '2026-06-01T00:00:00.000Z',
      },
      effectiveTo: {
        type: 'string',
        format: 'date-time',
        nullable: true,
        example: '2026-12-31T00:00:00.000Z',
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
        enum: ['ACTIVE', 'INACTIVE'],
        example: 'ACTIVE',
      },
      isDeleted: { type: 'boolean', example: false },
      createdAt: {
        type: 'string',
        format: 'date-time',
        example: '2026-06-24T08:00:00.000Z',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        example: '2026-06-24T08:00:00.000Z',
      },
      customer: {
        type: 'object',
        nullable: true,
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            example: 'a339bac0-d4cc-4468-a755-20a46ed06599',
          },
          name: { type: 'string', example: 'Acme Corp' },
        },
      },
      product: {
        type: 'object',
        nullable: true,
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            example: '33333333-3333-3333-3333-333333333301',
          },
          code: { type: 'string', example: 'PRD-001' },
          name: {
            description:
              'Resolved string when lang header is sent, raw JSON object otherwise',
            example: 'Portland Cement',
          },
        },
      },
      productGrade: {
        type: 'object',
        nullable: true,
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            example: '44444444-4444-4444-4444-444444444401',
          },
          gradeCode: { type: 'string', example: 'GRD-43' },
          name: {
            description:
              'Resolved string when lang header is sent, raw JSON object otherwise',
            example: 'Grade 43',
          },
        },
      },
      uom: {
        type: 'object',
        nullable: true,
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            example: '55555555-5555-5555-5555-555555555501',
          },
          code: { type: 'string', example: 'BAG' },
          name: {
            description:
              'Resolved string when lang header is sent, raw JSON object otherwise',
            example: 'Bag',
          },
        },
      },
      currency: {
        type: 'object',
        nullable: true,
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            example: 'cc000000-0000-0000-0000-000000000001',
          },
          code: { type: 'string', example: 'INR' },
          symbol: { type: 'string', example: '₹' },
          name: { example: 'Indian Rupee' },
        },
      },
    },
  },

  CustomerRateCreateBody: {
    type: 'object',
    required: [
      'customerId',
      'productId',
      'productGradeId',
      'rate',
      'currencyId',
      'uomId',
      'effectiveFrom',
    ],
    properties: {
      customerId: {
        type: 'string',
        format: 'uuid',
        example: 'a339bac0-d4cc-4468-a755-20a46ed06599',
      },
      productId: {
        type: 'string',
        format: 'uuid',
        example: '33333333-3333-3333-3333-333333333301',
      },
      productGradeId: {
        type: 'string',
        format: 'uuid',
        example: '44444444-4444-4444-4444-444444444401',
      },
      rate: { type: 'number', minimum: 0, example: 350 },
      currencyId: {
        type: 'string',
        format: 'uuid',
        example: 'cc000000-0000-0000-0000-000000000001',
      },
      uomId: {
        type: 'string',
        format: 'uuid',
        example: '55555555-5555-5555-5555-555555555501',
      },
      effectiveFrom: {
        type: 'string',
        format: 'date-time',
        example: '2026-06-01T00:00:00.000Z',
      },
      effectiveTo: {
        type: 'string',
        format: 'date-time',
        example: '2026-12-31T00:00:00.000Z',
      },
      status: {
        type: 'string',
        enum: ['ACTIVE', 'INACTIVE'],
        default: 'ACTIVE',
      },
    },
  },

  CustomerRateUpdateBody: {
    type: 'object',
    properties: {
      rate: { type: 'number', minimum: 0, example: 400 },
      currencyId: { type: 'string', format: 'uuid' },
      uomId: { type: 'string', format: 'uuid' },
      effectiveFrom: { type: 'string', format: 'date-time' },
      effectiveTo: { type: 'string', format: 'date-time' },
      status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
    },
  },

  CustomerRateSingleResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: {
        type: 'string',
        example: 'Customer rate retrieved successfully',
      },
      data: { $ref: '#/components/schemas/CustomerRateObject' },
    },
  },

  CustomerRateListResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: {
        type: 'string',
        example: 'Customer rates retrieved successfully',
      },
      pagination: {
        type: 'object',
        properties: {
          currentCount: { type: 'integer', example: 1 },
          totalCount: { type: 'integer', example: 3 },
          offset: { type: 'integer', example: 0 },
          limit: { type: 'integer', example: 10 },
        },
      },
      data: {
        type: 'array',
        items: { $ref: '#/components/schemas/CustomerRateObject' },
      },
    },
  },
};
