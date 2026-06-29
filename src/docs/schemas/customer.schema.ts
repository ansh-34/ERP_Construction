export const CustomerSchemas = {
  CustomerObject: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        example: 'a339bac0-d4cc-4468-a755-20a46ed06599',
      },
      name: { type: 'string', example: 'Acme Corp' },
      phoneCode: { type: 'string', example: '+91', nullable: true },
      phone: { type: 'string', example: '9876543210', nullable: true },
      paymentTerms: {
        type: 'string',
        enum: ['CASH', 'CREDIT'],
        example: 'CASH',
      },
      gstNumber: { type: 'string', example: '29ABCDE1234F1Z5', nullable: true },
      billingName: {
        type: 'string',
        example: 'Acme Corp Pvt Ltd',
        nullable: true,
      },
      billingAddress: {
        type: 'string',
        example: '12, MG Road, Bangalore',
        nullable: true,
      },
      shippingAddress: {
        type: 'string',
        example: '12, MG Road, Bangalore',
        nullable: true,
      },
      searchText: { type: 'string', example: 'acme corp +91 9876543210' },
      locationId: { type: 'string', format: 'uuid', nullable: true },
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
        example: '2026-06-24T07:18:45.609Z',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        example: '2026-06-24T07:18:45.609Z',
      },
    },
  },

  CustomerCreateBody: {
    type: 'object',
    required: ['name'],
    properties: {
      name: { type: 'string', example: 'Acme Corp' },
      phoneCode: { type: 'string', example: '+91' },
      phone: { type: 'string', example: '9876543210' },
      paymentTerms: {
        type: 'string',
        enum: ['CASH', 'CREDIT'],
        example: 'CASH',
      },
      gstNumber: { type: 'string', example: '29ABCDE1234F1Z5' },
      billingName: { type: 'string', example: 'Acme Corp Pvt Ltd' },
      billingAddress: { type: 'string', example: '12, MG Road, Bangalore' },
      shippingAddress: { type: 'string', example: '12, MG Road, Bangalore' },
      locationId: { type: 'string', format: 'uuid' },
      status: {
        type: 'string',
        enum: ['ACTIVE', 'INACTIVE'],
        default: 'ACTIVE',
      },
    },
  },

  CustomerUpdateBody: {
    type: 'object',
    properties: {
      name: { type: 'string', example: 'Acme Corp Updated' },
      phoneCode: { type: 'string', example: '+91' },
      phone: { type: 'string', example: '9999999999' },
      paymentTerms: { type: 'string', enum: ['CASH', 'CREDIT'] },
      gstNumber: { type: 'string', example: '29ABCDE1234F1Z5' },
      billingName: { type: 'string', example: 'Acme Corp Pvt Ltd' },
      billingAddress: { type: 'string', example: '12, MG Road, Bangalore' },
      shippingAddress: {
        type: 'string',
        example: '14, Brigade Road, Bangalore',
      },
      locationId: { type: 'string', format: 'uuid' },
      status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
    },
  },

  CustomerSingleResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Customer created successfully' },
      data: { $ref: '#/components/schemas/CustomerObject' },
    },
  },

  CustomerListResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Customers retrieved successfully' },
      pagination: {
        type: 'object',
        properties: {
          currentCount: { type: 'integer', example: 1 },
          totalCount: { type: 'integer', example: 5 },
          offset: { type: 'integer', example: 0 },
          limit: { type: 'integer', example: 10 },
        },
      },
      data: {
        type: 'array',
        items: { $ref: '#/components/schemas/CustomerObject' },
      },
    },
  },
};
