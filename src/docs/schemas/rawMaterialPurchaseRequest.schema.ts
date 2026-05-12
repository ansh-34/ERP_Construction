export const RawMaterialPurchaseRequestSchemas = {
  CreateRawMaterialPurchaseRequestBody: {
    type: 'object',
    required: [
      'type',
      'productId',
      'productGradeId',
      'quantity',
      'uomId',
      'requiredBy',
      'reason',
      'projectId',
    ],
    properties: {
      type: { type: 'string', enum: ['IMPORT', 'LOCAL'], example: 'LOCAL' },
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
      vendor: { type: 'string', example: 'BuildMax Supplies Pvt Ltd' },
      brand: { type: 'string', example: 'UltraTech' },
      requisitionRequestDocumentUrl: {
        type: 'string',
        format: 'uri',
        example: 'https://storage.example.com/docs/req-2026-001.pdf',
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
      vendor: { type: 'string' },
      brand: { type: 'string' },
      requisitionRequestDocumentUrl: { type: 'string', format: 'uri' },
      requiredBy: { type: 'string', format: 'date-time' },
      reason: { type: 'string' },
      projectId: { type: 'string', format: 'uuid' },
      status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
    },
  },
  ApproveRejectBody: {
    type: 'object',
    required: ['ids', 'approvalStatus'],
    properties: {
      ids: {
        oneOf: [
          { type: 'string', format: 'uuid' },
          {
            type: 'array',
            items: { type: 'string', format: 'uuid' },
            minItems: 1,
          },
        ],
        description: 'Single ID or array of IDs to approve/reject',
        example: [
          'a1b2c3d4-0001-0001-0001-000000000001',
          'a1b2c3d4-0001-0001-0001-000000000002',
        ],
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
      id: {
        type: 'string',
        format: 'uuid',
        example: '5c6d7e8f-9012-3456-7890-abcdef123456',
      },
      code: { type: 'string', example: 'RMPR-0001' },
      type: { type: 'string', example: 'LOCAL' },
      productId: { type: 'string', format: 'uuid' },
      productGradeId: { type: 'string', format: 'uuid' },
      quantity: { type: 'number', example: 500 },
      uomId: { type: 'string', format: 'uuid' },
      vendor: { type: 'string', example: 'BuildMax Supplies Pvt Ltd' },
      brand: { type: 'string', example: 'UltraTech' },
      requisitionRequestDocumentUrl: { type: 'string', nullable: true },
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
    },
  },
};
