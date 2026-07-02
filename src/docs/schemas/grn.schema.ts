export const GrnSchemas = {
  GrnObject: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        example: '123e4567-e89b-12d3-a456-426614174000',
      },
      code: { type: 'string', example: 'GRN-20260519103015' },
      productOrderCode: {
        type: 'string',
        example: 'PO-APP-123',
      },
      date: {
        type: 'string',
        format: 'date-time',
        example: '2026-05-19T10:30:15Z',
      },
      vendorId: {
        type: 'string',
        format: 'uuid',
        example: 'a63b0a70-87a4-44cd-9e90-252bfd83a152',
      },
      vendorName: { type: 'string', example: 'Supplier Inc.' },
      wbReference: { type: 'string', nullable: true, example: 'WB-456' },
      projectId: { type: 'string', format: 'uuid', nullable: true },
      domainId: { type: 'string', format: 'uuid' },
      invoiceId: { type: 'string', format: 'uuid' },
      approvalStatus: {
        type: 'string',
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        example: 'PENDING',
      },
      totalItems: { type: 'integer', example: 5 },
      totalAmount: { type: 'number', example: 155.5 },
      approvedAt: { type: 'string', format: 'date-time', nullable: true },
      status: { type: 'string', example: 'ACTIVE' },
      isDeleted: { type: 'boolean', example: false },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
      grnProducts: {
        type: 'array',
        items: { $ref: '#/components/schemas/GrnProductObject' },
        description: 'Associated product line items of this GRN.',
      },
    },
  },
  GrnProductObject: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      grnId: { type: 'string', format: 'uuid' },
      grnCode: { type: 'string' },
      date: { type: 'string', format: 'date-time' },
      productId: { type: 'string', format: 'uuid' },
      productGradeId: { type: 'string', format: 'uuid', nullable: true },
      product: {
        type: 'object',
        description: 'Resolved product (display name lives here).',
      },
      vendor: { type: 'string', example: 'Supplier Inc.' },
      quantity: { type: 'number', example: 100 },
      rate: { type: 'number', example: 10 },
      amt: {
        type: 'number',
        example: 1000,
        description: 'Calculated dynamically as (quantity * rate)',
      },
      uomId: { type: 'string', format: 'uuid' },
      projectId: { type: 'string', format: 'uuid', nullable: true },
      invoiceId: { type: 'string', format: 'uuid' },
      domainId: { type: 'string', format: 'uuid' },
      status: { type: 'string', example: 'ACTIVE' },
      isDeleted: { type: 'boolean', example: false },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  },
  // Create GRN is a discriminated union on `referenceType` (INVOICE | PO | NA).
  // Each variant carries a different reference + line-item shape.
  CreateGrnBody: {
    oneOf: [
      { $ref: '#/components/schemas/CreateGrnFromInvoiceBody' },
      { $ref: '#/components/schemas/CreateGrnFromPoBody' },
      { $ref: '#/components/schemas/CreateGrnNaBody' },
    ],
    discriminator: { propertyName: 'referenceType' },
  },
  CreateGrnFromInvoiceBody: {
    type: 'object',
    required: ['referenceType', 'invoiceId', 'grnProducts'],
    properties: {
      referenceType: { type: 'string', enum: ['INVOICE'], example: 'INVOICE' },
      invoiceId: { type: 'string', format: 'uuid' },
      wbReference: { type: 'string', example: 'WB-456' },
      grnProducts: {
        type: 'array',
        minItems: 1,
        items: {
          type: 'object',
          required: ['productId', 'quantity'],
          properties: {
            productId: { type: 'string', format: 'uuid' },
            quantity: { type: 'number', minimum: 0, example: 100 },
          },
        },
      },
    },
  },
  CreateGrnFromPoBody: {
    type: 'object',
    required: ['referenceType', 'purchaseOrderId', 'vendorId', 'grnProducts'],
    properties: {
      referenceType: { type: 'string', enum: ['PO'], example: 'PO' },
      purchaseOrderId: { type: 'string', format: 'uuid' },
      vendorId: { type: 'string', format: 'uuid' },
      wbReference: { type: 'string', example: 'WB-456' },
      grnProducts: {
        type: 'array',
        minItems: 1,
        items: {
          type: 'object',
          required: ['poProductId', 'quantity', 'rate', 'currencyId'],
          properties: {
            poProductId: { type: 'string', format: 'uuid' },
            quantity: { type: 'number', minimum: 0, example: 100 },
            rate: { type: 'number', minimum: 0, example: 10 },
            currencyId: { type: 'string', format: 'uuid' },
          },
        },
      },
    },
  },
  CreateGrnNaBody: {
    type: 'object',
    required: ['referenceType', 'vendorId', 'grnProducts'],
    properties: {
      referenceType: { type: 'string', enum: ['NA'], example: 'NA' },
      vendorId: { type: 'string', format: 'uuid' },
      projectId: { type: 'string', format: 'uuid' },
      wbReference: { type: 'string', example: 'WB-456' },
      grnProducts: {
        type: 'array',
        minItems: 1,
        items: {
          type: 'object',
          required: [
            'productId',
            'productGradeId',
            'quantity',
            'uomId',
            'currencyId',
          ],
          properties: {
            productId: { type: 'string', format: 'uuid' },
            productGradeId: { type: 'string', format: 'uuid' },
            quantity: { type: 'number', minimum: 0, example: 100 },
            rate: { type: 'number', minimum: 0, default: 0, example: 10 },
            uomId: { type: 'string', format: 'uuid' },
            currencyId: { type: 'string', format: 'uuid' },
          },
        },
      },
    },
  },
  CreateGrnProductBody: {
    type: 'object',
    required: ['productId', 'quantity'],
    properties: {
      productId: { type: 'string', format: 'uuid' },
      productGradeId: { type: 'string', format: 'uuid' },
      quantity: { type: 'number', example: 100 },
      rate: { type: 'number', example: 10 },
      uomId: { type: 'string', format: 'uuid' },
    },
  },
  UpdateGrnBody: {
    type: 'object',
    properties: {
      wbReference: { type: 'string', example: 'WB-456-UPDATED' },
      status: {
        type: 'string',
        enum: ['ACTIVE', 'INACTIVE'],
        example: 'ACTIVE',
      },
    },
  },
  UpdateGrnProductBody: {
    type: 'object',
    properties: {
      productId: { type: 'string', format: 'uuid' },
      productGradeId: { type: 'string', format: 'uuid' },
      quantity: { type: 'number', example: 120 },
      rate: { type: 'number', example: 12 },
      uomId: { type: 'string', format: 'uuid' },
    },
  },
  ApproveRejectGrnBody: {
    type: 'object',
    required: ['approvalStatus'],
    properties: {
      approvalStatus: {
        type: 'string',
        enum: ['APPROVED', 'REJECTED'],
        example: 'APPROVED',
      },
    },
  },
};
