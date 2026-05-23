export const InvoiceSchemas = {
  GenerateInvoicesFromPOBody: {
    type: 'object',
    required: ['assignments'],
    properties: {
      assignments: {
        type: 'array',
        items: {
          type: 'object',
          required: ['purchaseOrderProductId', 'vendorProductPricingId'],
          properties: {
            purchaseOrderProductId: { type: 'string', format: 'uuid' },
            vendorProductPricingId: { type: 'string', format: 'uuid' },
          },
        },
      },
    },
  },
  InvoiceObject: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      invoiceCode: { type: 'string', example: 'INV-DOMA-1716382000000' },
      purchaseOrderId: { type: 'string', format: 'uuid' },
      vendorId: { type: 'string', format: 'uuid', nullable: true },
      vendorName: { type: 'string', example: 'UltraTech Cement' },
      invoiceDate: { type: 'string', format: 'date-time' },
      dueDate: { type: 'string', format: 'date-time' },
      projectId: { type: 'string', format: 'uuid', nullable: true },
      paymentStatus: { type: 'string', example: 'UNPAID' },
      domainId: { type: 'string', format: 'uuid' },
      status: { type: 'string', example: 'ACTIVE' },
      isDeleted: { type: 'boolean', example: false },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  },
  InvoiceItemObject: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      invoiceId: { type: 'string', format: 'uuid' },
      productId: { type: 'string', format: 'uuid' },
      productGradeId: { type: 'string', format: 'uuid', nullable: true },
      description: { type: 'string', example: 'Cement bags' },
      quantity: { type: 'number', example: 100 },
      uomId: { type: 'string', format: 'uuid' },
      taxAmount: { type: 'number', example: 18 },
      totalAmount: { type: 'number', example: 45000 },
      discount: { type: 'number', example: 0 },
      domainId: { type: 'string', format: 'uuid' },
      status: { type: 'string', example: 'ACTIVE' },
      isDeleted: { type: 'boolean', example: false },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  },
};
