export const LastPurchaseRateSchemas = {
  LastPurchaseRateObject: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      productId: { type: 'string', format: 'uuid' },
      productGradeId: { type: 'string', format: 'uuid' },
      uomId: { type: 'string', format: 'uuid' },
      uomCode: { type: 'string', example: 'KG', nullable: true },
      uomName: {
        description: 'Flat string when ?lang= is passed, JSON object otherwise',
        example: 'Kilogram',
        nullable: true,
      },
      lastPrice: { type: 'number', example: 65000 },
      purchaseType: {
        type: 'string',
        enum: ['IMPORT', 'LOCAL'],
        nullable: true,
        example: 'IMPORT',
      },
      currencyId: { type: 'string', format: 'uuid', nullable: true },
      vendorId: { type: 'string', format: 'uuid', nullable: true },
      vendorName: { type: 'string', example: 'Acme Traders' },
      lastInvoiceId: { type: 'string', format: 'uuid', nullable: true },
      lastPurchaseDate: { type: 'string', format: 'date-time' },
      status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
      product: {
        type: 'object',
        nullable: true,
        properties: {
          id: { type: 'string', format: 'uuid' },
          code: { type: 'string', example: 'STEEL-001' },
          displayName: { example: 'TMT Steel' },
        },
      },
      productGrade: {
        type: 'object',
        nullable: true,
        properties: {
          id: { type: 'string', format: 'uuid' },
          gradeCode: { type: 'string', example: 'G500D' },
          gradeDisplayName: { example: 'Grade 500D' },
        },
      },
      currency: {
        type: 'object',
        nullable: true,
        properties: {
          id: { type: 'string', format: 'uuid' },
          code: { type: 'string', example: 'INR' },
          symbol: { type: 'string', example: '₹' },
          name: { example: 'Indian Rupee' },
        },
      },
    },
  },

  LastPurchaseRateListResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: {
        type: 'string',
        example: 'Product grade last purchase rates retrieved',
      },
      pagination: {
        type: 'object',
        properties: {
          total: { type: 'integer' },
          page: { type: 'integer' },
          limit: { type: 'integer' },
          totalPages: { type: 'integer' },
        },
      },
      data: {
        type: 'array',
        items: { $ref: '#/components/schemas/LastPurchaseRateObject' },
      },
    },
  },

  LastPurchaseRateSingleResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: {
        type: 'string',
        example: 'Product grade last purchase rates retrieved',
      },
      data: { $ref: '#/components/schemas/LastPurchaseRateObject' },
    },
  },
};
