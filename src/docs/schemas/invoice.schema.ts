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
      invoiceType: {
        type: 'string',
        enum: ['PROFORMA', 'FINAL'],
        example: 'FINAL',
      },
      lifecycle: {
        type: 'string',
        enum: ['ACTIVE', 'VOID'],
        example: 'ACTIVE',
      },
      pdfStatus: {
        type: 'string',
        enum: ['PENDING', 'PROCESSING', 'READY', 'FAILED'],
        example: 'READY',
      },
      pdfUrl: {
        type: 'string',
        nullable: true,
        description: 'Stored object key/URL for the generated PDF.',
        example: 'invoices/INV-DOMA-1716382000000.pdf',
      },
      pdfGeneratedAt: {
        type: 'string',
        format: 'date-time',
        nullable: true,
      },
      pdfVersion: { type: 'integer', example: 1 },
      domainId: { type: 'string', format: 'uuid' },
      status: { type: 'string', example: 'ACTIVE' },
      isDeleted: { type: 'boolean', example: false },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  },
  FinalizeInvoiceBody: {
    type: 'object',
    required: ['items'],
    properties: {
      items: {
        type: 'array',
        minItems: 1,
        description:
          'Full replacement item list for the final invoice. Each line is uniquely identified by (productId, productGradeId, uomId).',
        items: {
          type: 'object',
          required: ['productId', 'uomId', 'quantity', 'rate'],
          properties: {
            productId: { type: 'string', format: 'uuid' },
            productGradeId: {
              type: 'string',
              format: 'uuid',
              nullable: true,
            },
            uomId: { type: 'string', format: 'uuid' },
            quantity: { type: 'number', example: 100, description: 'Must be > 0' },
            rate: { type: 'number', example: 450, description: 'Must be >= 0' },
          },
        },
      },
    },
  },
  InvoicePdfStatusObject: {
    type: 'object',
    properties: {
      pdfStatus: {
        type: 'string',
        enum: ['PENDING', 'PROCESSING', 'READY', 'FAILED'],
        example: 'READY',
      },
      pdfUrl: {
        type: 'string',
        nullable: true,
        description: 'Stored object key for the generated PDF.',
        example: 'invoices/INV-DOMA-1716382000000.pdf',
      },
      downloadUrl: {
        type: 'string',
        nullable: true,
        description: 'Signed, time-limited URL to download the PDF (only when READY).',
        example: 'https://s3.amazonaws.com/bucket/invoices/...?X-Amz-Signature=...',
      },
      pdfGeneratedAt: {
        type: 'string',
        format: 'date-time',
        nullable: true,
      },
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
