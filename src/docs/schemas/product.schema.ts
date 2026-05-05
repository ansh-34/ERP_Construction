export const ProductSchemas = {
  CreateProductBody: {
    type: 'object',
    required: ['displayName', 'code', 'productType'],
    properties: {
      displayName: { type: 'object', description: 'Localized name', example: { en: 'Sand' } },
      code: { type: 'string', example: 'SAND' },
      productType: { type: 'string', example: 'RAW_MATERIAL' },
      status: { type: 'string', default: 'active' },
    },
  },
  UpdateProductBody: {
    type: 'object',
    properties: {
      displayName: { type: 'object', example: { en: 'Sand Updated' } },
      code: { type: 'string' },
      productType: { type: 'string' },
      status: { type: 'string' },
    },
  },
  ProductListResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Products retrieved' },
      pagination: {
        type: 'object',
        properties: {
          currentCount: { type: 'integer', example: 10 },
          totalCount: { type: 'integer', example: 25 },
          offset: { type: 'integer', example: 0 },
          limit: { type: 'integer', example: 10 },
        },
      },
      data: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            displayName: { type: 'object', example: { en: 'Sand' } },
            code: { type: 'string', example: 'SAND' },
            productType: { type: 'string', example: 'RAW_MATERIAL' },
            status: { type: 'string', example: 'active' },
            _count: {
              type: 'object',
              properties: {
                productGrades: { type: 'integer', example: 3 },
                productUoms: { type: 'integer', example: 2 },
                inventories: { type: 'integer', example: 5 },
              },
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  },
  ProductDetailResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Products retrieved' },
      data: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          displayName: { type: 'object', example: { en: 'Sand' } },
          code: { type: 'string', example: 'SAND' },
          productType: { type: 'string', example: 'RAW_MATERIAL' },
          status: { type: 'string', example: 'active' },
          productGrades: {
            type: 'array',
            items: {
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
                      stdRateType: { type: 'object', example: { en: 'Purchase Rate' } },
                      stdRateValue: { type: 'number', example: 450 },
                      alertThresold: { type: 'number', example: 500 },
                      status: { type: 'string', example: 'active' },
                    },
                  },
                },
                inventories: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', format: 'uuid' },
                      quantity: { type: 'number', example: 1200 },
                      reorderLevel: { type: 'number', example: 500 },
                      status: { type: 'string', example: 'active' },
                      uom: {
                        type: 'object',
                        properties: {
                          id: { type: 'string', format: 'uuid' },
                          displayName: { type: 'object', example: { en: 'Kilogram' } },
                          code: { type: 'string', example: 'KG' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          productUoms: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                status: { type: 'string', example: 'active' },
                createdAt: { type: 'string', format: 'date-time' },
                uom: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', format: 'uuid' },
                    displayName: { type: 'object', example: { en: 'Kilogram' } },
                    code: { type: 'string', example: 'KG' },
                    conversionRate: { type: 'number', example: 1 },
                  },
                },
              },
            },
          },
          productGradeStdRates: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                stdRateType: { type: 'object', example: { en: 'Purchase Rate' } },
                stdRateValue: { type: 'number', example: 450 },
                alertThresold: { type: 'number', example: 500 },
                status: { type: 'string', example: 'active' },
                createdAt: { type: 'string', format: 'date-time' },
                productGrade: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', format: 'uuid' },
                    gradeDisplayName: { type: 'object', example: { en: 'Fine Sand' } },
                    gradeCode: { type: 'string', example: 'FS' },
                  },
                },
              },
            },
          },
          inventories: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                quantity: { type: 'number', example: 1200 },
                reorderLevel: { type: 'number', example: 500 },
                status: { type: 'string', example: 'active' },
                createdAt: { type: 'string', format: 'date-time' },
                productGrade: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', format: 'uuid' },
                    gradeDisplayName: { type: 'object', example: { en: 'Fine Sand' } },
                    gradeCode: { type: 'string', example: 'FS' },
                  },
                },
                uom: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', format: 'uuid' },
                    displayName: { type: 'object', example: { en: 'Kilogram' } },
                    code: { type: 'string', example: 'KG' },
                  },
                },
              },
            },
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
  CreateProductGradeBody: {
    type: 'object',
    required: ['gradeDisplayName', 'gradeCode'],
    properties: {
      gradeDisplayName: { type: 'object', description: 'Localized name', example: { en: 'Grade A' } },
      gradeCode: { type: 'string', example: 'GA' },
      status: { type: 'string', default: 'active' },
    },
  },
  UpdateProductGradeBody: {
    type: 'object',
    properties: {
      gradeDisplayName: { type: 'object' },
      gradeCode: { type: 'string' },
      status: { type: 'string' },
    },
  },
  CreateProductGradeStdRateBody: {
    type: 'object',
    required: ['stdRateType', 'stdRateValue', 'alertThresold'],
    properties: {
      stdRateType: { type: 'object', description: 'Localized type', example: { en: 'Base Rate' } },
      stdRateValue: { type: 'number', example: 450 },
      alertThresold: { type: 'number', example: 500 },
      status: { type: 'string', default: 'active' },
    },
  },
  CreateProductUomBody: {
    type: 'object',
    required: ['uomId'],
    properties: {
      uomId: { type: 'string', format: 'uuid' },
      status: { type: 'string', default: 'active' },
    },
  },
};
