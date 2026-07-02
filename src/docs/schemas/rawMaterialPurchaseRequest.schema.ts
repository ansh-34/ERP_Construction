export const RawMaterialPurchaseRequestSchemas = {
  CreateRawMaterialPurchaseRequestBody: {
    type: 'object',
    required: ['type', 'requiredBy', 'reason', 'projectId', 'items'],
    properties: {
      type: { type: 'string', enum: ['IMPORT', 'LOCAL'], example: 'LOCAL' },
      documentId: {
        type: 'string',
        format: 'uuid',
        example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
      },
      requiredBy: {
        type: 'string',
        format: 'date-time',
        example: '2026-06-15T00:00:00.000Z',
      },
      reason: {
        type: 'string',
        example:
          'Foundation work for Block A requires 500 KG of OPC 53 grade cement',
      },
      projectId: {
        type: 'string',
        format: 'uuid',
        example: 'b2c3d4e5-f6a7-8901-bcde-f12345678902',
      },
      items: {
        type: 'array',
        minItems: 1,
        items: {
          type: 'object',
          required: ['productId', 'productGradeId', 'quantity', 'uomId'],
          properties: {
            productId: {
              type: 'string',
              format: 'uuid',
              example: '3a4b5c6d-7e8f-9012-3456-789abcdef012',
            },
            productGradeId: {
              type: 'string',
              format: 'uuid',
              example: '4b5c6d7e-8f90-1234-5678-9abcdef01234',
            },
            quantity: { type: 'number', minimum: 0, example: 500 },
            uomId: {
              type: 'string',
              format: 'uuid',
              example: '7f8e9d0c-1b2a-3c4d-5e6f-7a8b9c0d1e2f',
            },
            brand: { type: 'string', example: 'UltraTech' },
          },
        },
      },
    },
  },
  UpdateRawMaterialPurchaseRequestBody: {
    type: 'object',
    properties: {
      type: { type: 'string', enum: ['IMPORT', 'LOCAL'] },
      productId: { type: 'string', format: 'uuid' },
      productGradeId: { type: 'string', format: 'uuid' },
      quantity: { type: 'number', minimum: 0 },
      uomId: { type: 'string', format: 'uuid' },
      brand: { type: 'string' },
      documentId: { type: 'string', format: 'uuid' },
      requiredBy: { type: 'string', format: 'date-time' },
      reason: { type: 'string' },
      projectId: { type: 'string', format: 'uuid' },
      status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
    },
  },
  ApproveRejectBody: {
    type: 'object',
    required: ['code', 'approvalStatus'],
    properties: {
      code: {
        type: 'string',
        description:
          'Code of the raw material purchase request group to approve/reject',
        example: 'RMPR-DOMA-1716382000000',
      },
      approvalStatus: {
        type: 'string',
        enum: ['APPROVED', 'REJECTED'],
        example: 'APPROVED',
      },
    },
  },
  RawMaterialPurchaseRequestObject: {
    type: 'object',
    properties: {
      code: { type: 'string', example: 'RMPR-DOMA-1716382000000' },
      type: { type: 'string', example: 'LOCAL' },
      documentId: { type: 'string', format: 'uuid', nullable: true },
      documentUrl: { type: 'string', nullable: true },
      document: {
        type: 'object',
        nullable: true,
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          url: { type: 'string' },
        },
      },
      requiredBy: {
        type: 'string',
        format: 'date-time',
        example: '2026-06-15T00:00:00.000Z',
      },
      reason: { type: 'string', example: 'Foundation work for Block A' },
      requestedBy: { type: 'string', format: 'uuid' },
      projectId: { type: 'string', format: 'uuid' },
      domainId: { type: 'string', format: 'uuid' },
      approvalStatus: {
        type: 'string',
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        example: 'PENDING',
      },
      status: { type: 'string', example: 'ACTIVE' },
      isDeleted: { type: 'boolean', example: false },
      createdAt: {
        type: 'string',
        format: 'date-time',
        example: '2026-05-12T10:30:00.000Z',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        example: '2026-05-12T10:30:00.000Z',
      },
      purchaseOrderId: { type: 'string', format: 'uuid', nullable: true },
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '5c6d7e8f-9012-3456-7890-abcdef123456',
            },
            productId: { type: 'string', format: 'uuid' },
            productGradeId: { type: 'string', format: 'uuid' },
            quantity: { type: 'number', example: 500 },
            uomId: { type: 'string', format: 'uuid' },
            brand: { type: 'string', example: 'UltraTech' },
            status: { type: 'string', example: 'ACTIVE' },
            isDeleted: { type: 'boolean', example: false },
          },
        },
      },
    },
  },
  PurchaseOrderObject: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        example: '5c6d7e8f-9012-3456-7890-abcdef123456',
      },
      code: { type: 'string', example: 'PO-DOMA-1716382000000' },
      sourceRmprCode: {
        type: 'string',
        example: 'RMPR-DOMA-1716382000000',
        nullable: true,
      },
      date: {
        type: 'string',
        format: 'date-time',
        example: '2026-05-12T10:30:00.000Z',
      },
      orderStatus: {
        type: 'string',
        enum: ['PENDING_VENDOR', 'INVOICED'],
        example: 'PENDING_VENDOR',
      },
      projectId: { type: 'string', format: 'uuid', nullable: true },
      domainId: { type: 'string', format: 'uuid' },
      status: { type: 'string', example: 'ACTIVE' },
      isDeleted: { type: 'boolean', example: false },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  },
  PurchaseOrderProductObject: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        example: '5c6d7e8f-9012-3456-7890-abcdef123456',
      },
      purchaseOrderId: { type: 'string', format: 'uuid' },
      orderCode: { type: 'string', example: 'PO-DOMA-1716382000000' },
      productName: { type: 'string', example: 'OPC 53 grade cement' },
      productGradeName: {
        type: 'string',
        example: 'OPC 53',
        nullable: true,
      },
      productCode: { type: 'string', example: 'PROD-123', nullable: true },
      productGradeCode: { type: 'string', example: 'GRADE-53', nullable: true },
      quantity: { type: 'number', example: 500 },
      tax: { type: 'number', example: 18 },
      uomId: { type: 'string', format: 'uuid' },
      uomCode: { type: 'string', example: 'KG', nullable: true },
      rate: { type: 'number', example: 450 },
      projectId: { type: 'string', format: 'uuid', nullable: true },
      domainId: { type: 'string', format: 'uuid' },
      status: { type: 'string', example: 'ACTIVE' },
      isDeleted: { type: 'boolean', example: false },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  },
};
