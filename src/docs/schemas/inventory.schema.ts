export const InventorySchemas = {
  AddInventoryBody: {
    type: 'object',
    required: ['productId', 'productGradeId', 'quantity', 'uomId'],
    properties: {
      productId: { type: 'string', format: 'uuid' },
      productGradeId: { type: 'string', format: 'uuid' },
      quantity: { type: 'number', minimum: 0, example: 1200 },
      uomId: { type: 'string', format: 'uuid' },
      reorderLevel: { type: 'number', minimum: 0, default: 0, example: 500 },
    },
  },
  UpdateReorderLevelBody: {
    type: 'object',
    required: ['reorderLevel'],
    properties: {
      reorderLevel: { type: 'number', minimum: 0, example: 500 },
    },
  },
  InventoryStatsResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Inventory stats retrieved' },
      data: {
        type: 'object',
        properties: {
          totalItems: { type: 'integer', example: 45 },
          activeCount: { type: 'integer', example: 40 },
          inactiveCount: { type: 'integer', example: 5 },
          totalQuantity: { type: 'number', example: 15000 },
          lowStockCount: { type: 'integer', example: 8 },
          outOfStockCount: { type: 'integer', example: 3 },
          uniqueProductCount: { type: 'integer', example: 12 },
        },
      },
    },
  },
  InventoryEntryResponse: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      quantity: { type: 'number', example: 1200 },
      reorderLevel: { type: 'number', example: 500 },
      status: { type: 'string', example: 'active' },
      product: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          displayName: { type: 'object', example: { en: 'Sand' } },
          code: { type: 'string', example: 'SAND' },
          productType: { type: 'string', example: 'RAW_MATERIAL' },
          _count: {
            type: 'object',
            properties: {
              productGrades: { type: 'integer', example: 3 },
              productUoms: { type: 'integer', example: 2 },
            },
          },
        },
      },
      productGrade: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          gradeDisplayName: { type: 'object', example: { en: 'Fine Sand' } },
          gradeCode: { type: 'string', example: 'FS' },
          status: { type: 'string', example: 'active' },
          productGradeStdRates: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                stdRateType: {
                  type: 'object',
                  example: { en: 'Purchase Rate' },
                },
                stdRateValue: { type: 'number', example: 450 },
                alertThresold: { type: 'number', example: 500 },
                status: { type: 'string', example: 'active' },
              },
            },
          },
        },
      },
      uom: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          displayName: { type: 'object', example: { en: 'Kilogram' } },
          code: { type: 'string', example: 'KG' },
          conversionRate: { type: 'number', example: 1 },
        },
      },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  },
  InventoryListResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Inventory retrieved' },
      pagination: {
        type: 'object',
        properties: {
          currentCount: { type: 'integer', example: 10 },
          totalCount: { type: 'integer', example: 45 },
          offset: { type: 'integer', example: 0 },
          limit: { type: 'integer', example: 10 },
        },
      },
      data: {
        type: 'array',
        items: { $ref: '#/components/schemas/InventoryEntryResponse' },
      },
    },
  },
};
