const SaleOrderProductObject = {
  type: 'object',
  properties: {
    id: {
      type: 'string',
      format: 'uuid',
      example: '7b76615c-053b-4f38-9713-79236eddba73',
    },
    saleOrderId: {
      type: 'string',
      format: 'uuid',
      example: 'e6d2aa1e-f784-45d4-bc01-ad27dfaad9d8',
    },
    productId: {
      type: 'string',
      format: 'uuid',
      example: '33333333-3333-3333-3333-333333333301',
    },
    productGradeId: {
      type: 'string',
      format: 'uuid',
      nullable: true,
      example: '44444444-4444-4444-4444-444444444401',
    },
    quantity: { type: 'number', example: 20 },
    uomId: {
      type: 'string',
      format: 'uuid',
      example: '55555555-5555-5555-5555-555555555501',
    },
    unitRate: { type: 'number', example: 350 },
    amount: {
      type: 'number',
      description: 'Auto-calculated: unitRate × quantity',
      example: 7000,
    },
    taxAmount: { type: 'number', example: 630 },
    transportationCharge: { type: 'number', example: 300 },
    royaltyAmount: { type: 'number', example: 150 },
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
    status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'], example: 'ACTIVE' },
    isDeleted: { type: 'boolean', example: false },
    createdAt: {
      type: 'string',
      format: 'date-time',
      example: '2026-06-24T10:17:58.429Z',
    },
    updatedAt: {
      type: 'string',
      format: 'date-time',
      example: '2026-06-24T10:17:58.429Z',
    },
    product: {
      type: 'object',
      nullable: true,
      description:
        'When lang header is sent: name is a string. Without lang: name is raw JSON {"en":"...","hi":"..."}',
      properties: {
        id: {
          type: 'string',
          format: 'uuid',
          example: '33333333-3333-3333-3333-333333333301',
        },
        code: { type: 'string', example: 'PRD-001' },
        name: { example: 'Portland Cement' },
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
        name: { example: 'Grade 43' },
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
        name: { example: 'Bag' },
      },
    },
  },
};

const SaleOrderObject = {
  type: 'object',
  properties: {
    id: {
      type: 'string',
      format: 'uuid',
      example: 'e6d2aa1e-f784-45d4-bc01-ad27dfaad9d8',
    },
    ticketNumber: {
      type: 'string',
      description: 'Auto-generated as TK-0001, TK-0002... if not provided',
      example: 'TK-0008',
    },
    date: {
      type: 'string',
      format: 'date-time',
      example: '2026-06-24T10:17:58.425Z',
    },
    entryType: {
      type: 'string',
      enum: ['PLANT_ENTRY', 'MANUAL'],
      example: 'MANUAL',
    },
    customerId: {
      type: 'string',
      format: 'uuid',
      example: 'a339bac0-d4cc-4468-a755-20a46ed06599',
    },
    customerName: {
      type: 'string',
      description: 'Auto-fetched from Customer table',
      example: 'Acme Corp',
    },
    customerPhone: {
      type: 'string',
      description: 'Auto-fetched from Customer table (phoneCode + phone)',
      example: '+919876543210',
    },
    totalAmount: {
      type: 'number',
      description:
        'Auto-calculated: sum of (unitRate × quantity) across all product lines',
      example: 12000,
    },
    totalTaxAmount: {
      type: 'number',
      description: 'Auto-calculated: sum of taxAmount across all product lines',
      example: 765,
    },
    totalTransportationCharges: {
      type: 'number',
      description:
        'Auto-calculated: sum of transportationCharge across all product lines',
      example: 500,
    },
    totalRoyaltyCharges: {
      type: 'number',
      description:
        'Auto-calculated: sum of royaltyAmount across all product lines',
      example: 200,
    },
    paymentType: { type: 'string', enum: ['CASH', 'CREDIT'], example: 'CASH' },
    orderStatus: {
      type: 'string',
      enum: ['PENDING', 'INPROGRESS', 'INVOICED'],
      example: 'PENDING',
    },
    remarks: { type: 'string', nullable: true, example: null },
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
    status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'], example: 'ACTIVE' },
    isDeleted: { type: 'boolean', example: false },
    createdAt: {
      type: 'string',
      format: 'date-time',
      example: '2026-06-24T10:17:58.425Z',
    },
    updatedAt: {
      type: 'string',
      format: 'date-time',
      example: '2026-06-24T10:17:58.425Z',
    },
    saleOrderProducts: { type: 'array', items: SaleOrderProductObject },
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
        phoneCode: { type: 'string', example: '+91', nullable: true },
        phone: { type: 'string', example: '9876543210', nullable: true },
        paymentTerms: {
          type: 'string',
          enum: ['CASH', 'CREDIT'],
          example: 'CASH',
        },
      },
    },
  },
};

export const SaleOrderSchemas = {
  SaleOrderProductObject,
  SaleOrderObject,

  SaleOrderProductInput: {
    type: 'object',
    required: ['productId', 'quantity', 'uomId', 'unitRate'],
    properties: {
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
      quantity: {
        type: 'number',
        minimum: 0,
        exclusiveMinimum: true,
        example: 20,
      },
      uomId: {
        type: 'string',
        format: 'uuid',
        example: '55555555-5555-5555-5555-555555555501',
      },
      unitRate: { type: 'number', minimum: 0, example: 350 },
      taxAmount: {
        type: 'number',
        minimum: 0,
        default: 0,
        description: 'Optional — defaults to 0',
        example: 630,
      },
      transportationCharge: {
        type: 'number',
        minimum: 0,
        default: 0,
        description: 'Optional — defaults to 0',
        example: 300,
      },
      royaltyAmount: {
        type: 'number',
        minimum: 0,
        default: 0,
        description: 'Optional — defaults to 0',
        example: 150,
      },
    },
  },

  SaleOrderCreateBody: {
    type: 'object',
    description:
      'totalAmount, totalTaxAmount, totalTransportationCharges, totalRoyaltyCharges are auto-calculated from product lines — do not send them. customerName and customerPhone are auto-fetched from the customer record.',
    required: ['customerId', 'products'],
    properties: {
      ticketNumber: {
        type: 'string',
        description: 'Optional. Auto-generated TK-XXXX series if omitted.',
        example: 'TK-0008',
      },
      date: {
        type: 'string',
        format: 'date-time',
        example: '2026-06-24T10:00:00.000Z',
      },
      entryType: {
        type: 'string',
        enum: ['PLANT_ENTRY', 'MANUAL'],
        default: 'MANUAL',
      },
      customerId: {
        type: 'string',
        format: 'uuid',
        description:
          'Required. customerName and customerPhone are auto-fetched from this record and must not be sent.',
        example: 'a339bac0-d4cc-4468-a755-20a46ed06599',
      },
      paymentType: {
        type: 'string',
        enum: ['CASH', 'CREDIT'],
        default: 'CASH',
      },
      orderStatus: {
        type: 'string',
        enum: ['PENDING', 'INPROGRESS', 'INVOICED'],
        default: 'PENDING',
      },
      remarks: { type: 'string', example: 'First order for this customer' },
      products: {
        type: 'array',
        minItems: 1,
        items: { $ref: '#/components/schemas/SaleOrderProductInput' },
      },
    },
  },

  SaleOrderUpdateBody: {
    type: 'object',
    description:
      'All fields optional. Products use upsert: keyed on (productId + productGradeId + uomId) — same key updates other fields, new key adds without removing existing lines. Omit products to leave them untouched. Totals are always re-calculated from all current product lines after update.',
    properties: {
      ticketNumber: { type: 'string', example: 'TK-0009' },
      date: { type: 'string', format: 'date-time' },
      entryType: { type: 'string', enum: ['PLANT_ENTRY', 'MANUAL'] },
      customerId: {
        type: 'string',
        format: 'uuid',
        description:
          'Re-fetches customerName and customerPhone from the new customer',
      },
      paymentType: { type: 'string', enum: ['CASH', 'CREDIT'] },
      orderStatus: {
        type: 'string',
        enum: ['PENDING', 'INPROGRESS', 'INVOICED'],
      },
      remarks: { type: 'string' },
      status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
      products: {
        type: 'array',
        minItems: 1,
        items: { $ref: '#/components/schemas/SaleOrderProductInput' },
      },
    },
  },

  SaleOrderSingleResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Sale order created successfully' },
      data: { $ref: '#/components/schemas/SaleOrderObject' },
    },
  },

  SaleOrderListResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: {
        type: 'string',
        example: 'Sale orders retrieved successfully',
      },
      pagination: {
        type: 'object',
        properties: {
          currentCount: { type: 'integer', example: 1 },
          totalCount: { type: 'integer', example: 8 },
          offset: { type: 'integer', example: 0 },
          limit: { type: 'integer', example: 10 },
        },
      },
      data: {
        type: 'array',
        items: { $ref: '#/components/schemas/SaleOrderObject' },
      },
    },
  },

  SaleOrderProductListResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Sale order retrieved successfully' },
      data: {
        type: 'array',
        items: { $ref: '#/components/schemas/SaleOrderProductObject' },
      },
    },
  },

  SaleOrderDeleteResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Sale order deleted successfully' },
      data: { type: 'object', nullable: true, example: null },
    },
  },
};
