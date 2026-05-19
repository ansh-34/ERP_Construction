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
        nullable: true,
        example: 'PO-APP-123',
      },
      date: {
        type: 'string',
        format: 'date-time',
        example: '2026-05-19T10:30:15Z',
      },
      vendor: { type: 'string', example: 'Supplier Inc.' },
      wbReference: { type: 'string', nullable: true, example: 'WB-456' },
      projectId: { type: 'string', format: 'uuid', nullable: true },
      domainId: { type: 'string', format: 'uuid' },
      approvalStatus: {
        type: 'string',
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        example: 'PENDING',
      },
      totalItems: { type: 'integer', example: 5 },
      totalTax: { type: 'number', example: 15.5 },
      totalAmount: { type: 'number', example: 155.5 },
      approvedAt: { type: 'string', format: 'date-time', nullable: true },
      status: { type: 'string', example: 'ACTIVE' },
      isDeleted: { type: 'boolean', example: false },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  },
  GrnProductObject: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      grnId: { type: 'string', format: 'uuid' },
      grnCode: { type: 'string' },
      date: { type: 'string', format: 'date-time' },
      material: { type: 'string', example: 'Cement' },
      vendor: { type: 'string', example: 'Supplier Inc.' },
      quantity: { type: 'number', example: 100 },
      rate: { type: 'number', example: 10 },
      tax: { type: 'number', example: 5 },
      uomId: { type: 'string', format: 'uuid' },
      projectId: { type: 'string', format: 'uuid', nullable: true },
      domainId: { type: 'string', format: 'uuid' },
      status: { type: 'string', example: 'ACTIVE' },
      isDeleted: { type: 'boolean', example: false },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  },
  CreateGrnProductBody: {
    type: 'object',
    required: [
      'date',
      'material',
      'vendor',
      'quantity',
      'rate',
      'tax',
      'uomId',
    ],
    properties: {
      date: {
        type: 'string',
        format: 'date-time',
        example: '2026-05-19T10:30:15Z',
      },
      material: { type: 'string', example: 'Cement' },
      vendor: { type: 'string', example: 'Supplier Inc.' },
      quantity: { type: 'number', example: 100 },
      rate: { type: 'number', example: 10 },
      tax: { type: 'number', example: 5 },
      uomId: { type: 'string', format: 'uuid' },
      projectId: { type: 'string', format: 'uuid', nullable: true },
    },
  },
  CreateGrnBody: {
    type: 'object',
    required: ['date', 'vendor'],
    properties: {
      productOrderCode: {
        type: 'string',
        nullable: true,
        example: 'PO-APP-123',
      },
      date: {
        type: 'string',
        format: 'date-time',
        example: '2026-05-19T10:30:15Z',
      },
      vendor: { type: 'string', example: 'Supplier Inc.' },
      wbReference: { type: 'string', nullable: true, example: 'WB-456' },
      projectId: { type: 'string', format: 'uuid', nullable: true },
      grnProducts: {
        type: 'array',
        items: { $ref: '#/components/schemas/CreateGrnProductBody' },
      },
    },
  },
  UpdateGrnBody: {
    type: 'object',
    properties: {
      vendor: { type: 'string', example: 'Supplier Inc. Updated' },
      wbReference: { type: 'string', example: 'WB-456-UPDATED' },
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
