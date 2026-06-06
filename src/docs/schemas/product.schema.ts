export const ProductSchemas = {
  CreateProductBody: {
    type: 'object',
    required: ['displayName', 'productType'],
    properties: {
      displayName: {
        type: 'object',
        description: 'Localized name',
        example: { en: 'TMT Rebars' },
      },
      productType: {
        type: 'string',
        enum: ['RAW_MATERIAL', 'FINISHED_PRODUCT'],
        example: 'RAW_MATERIAL',
      },
      status: { type: 'string', default: 'active' },
      grades: {
        type: 'array',
        description:
          'Optional array of grades to create with the product. ' +
          'Multiple grades can be supplied at once. Each grade gets an implicit ' +
          'zero-based index which can be referenced in standardRates via gradeIndex.',
        items: { $ref: '#/components/schemas/GradeItem' },
      },
      standardRates: {
        type: 'array',
        description:
          'Optional array of standard rates. Link to a grade via gradeIndex (preferred for new grades), ' +
          'gradeCode, or gradeId. Multiple rates per grade are supported.',
        items: { $ref: '#/components/schemas/StandardRateItem' },
      },
    },
  },

  UpdateProductBody: {
    type: 'object',
    properties: {
      displayName: { type: 'object', example: { en: 'TMT Rebars Updated' } },
      code: { type: 'string' },
      productType: {
        type: 'string',
        enum: ['RAW_MATERIAL', 'FINISHED_PRODUCT'],
      },
      status: { type: 'string', example: 'inactive' },
      grades: {
        type: 'array',
        description:
          'Optional array of grades. Items with id are updated; without id are created.',
        items: { $ref: '#/components/schemas/GradeItem' },
      },
      standardRates: {
        type: 'array',
        description:
          'Optional array of standard rates. Items with id are updated (partial — only supply changed fields); without id are created.',
        items: { $ref: '#/components/schemas/StandardRateItem' },
      },
    },
  },

  GradeItem: {
    type: 'object',
    required: ['gradeDisplayName'],
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        description:
          'OPTIONAL. Pass an existing UUID to update an item. Omit entirely to create a new item.',
      },
      gradeDisplayName: {
        type: 'object',
        description: 'Localized grade name',
        example: { en: 'Grade 500D' },
      },
      gradeCode: {
        type: 'string',
        description:
          'Auto-derived from en name if omitted (e.g. "Grade 500D" → "GRADE_500D"). ' +
          'If omitted, predict the auto-generated code and use it in standardRates.gradeCode to link them.',
        example: 'GRADE_500D',
      },
      status: {
        type: 'string',
        enum: ['active', 'inactive'],
        default: 'active',
      },
    },
  },

  StandardRateItem: {
    type: 'object',
    // FIX 3: Removed required constraint on stdRateType/stdRateValue/alertThresold so
    // that partial updates (id + changed fields only, as shown in Postman "Update Standard Rates")
    // are valid. Only id is conditionally required for updates; all fields are optional here
    // and validated server-side based on whether it's a create or update operation.
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        description:
          'OPTIONAL. Pass an existing UUID to update. Omit entirely to create a new rate. ' +
          'When updating, only supply the fields you want to change alongside id.',
      },
      gradeId: {
        type: 'string',
        format: 'uuid',
        description: 'UUID of the grade this rate belongs to.',
      },
      gradeCode: {
        type: 'string',
        description:
          'Alternative to gradeId — resolved server-side. Use the exact gradeCode ' +
          '(or predicted auto-generated one, e.g. "GRADE_500D") to link this rate to a grade.',
      },
      // FIX 4: Added gradeIndex — Postman comments indicate rates are linked to grades
      // by their zero-based position in the grades array during product creation.
      gradeIndex: {
        type: 'integer',
        minimum: 0,
        description:
          'Zero-based index into the grades array in the same request. ' +
          'Used during product creation to link a standard rate to a new grade ' +
          'without needing to know its id or gradeCode in advance. ' +
          'Takes precedence over gradeCode if both are supplied.',
        example: 0,
      },
      stdRateType: {
        type: 'object',
        description: 'Localized rate type',
        example: { en: 'Purchase Rate' },
      },
      stdRateValue: { type: 'number', example: 65000 },
      alertThresold: { type: 'number', example: 70000 },
      status: {
        type: 'string',
        enum: ['active', 'inactive'],
        default: 'active',
      },
    },
  },

  BulkUpdateGradesBody: {
    type: 'object',
    required: ['grades'],
    properties: {
      grades: {
        type: 'array',
        description:
          'Array of grade items. Items with id are updated (partial update supported — only supply changed fields + id); ' +
          'items without id are created. Matches Postman "Update Grades" payload.',
        items: { $ref: '#/components/schemas/GradeItem' },
        example: [
          {
            id: '{{existingGradeId}}',
            gradeDisplayName: { en: 'Grade 500D Updated' },
            status: 'active',
          },
        ],
      },
    },
  },

  BulkUpdateStdRatesBody: {
    type: 'object',
    required: ['standardRates'],
    properties: {
      standardRates: {
        type: 'array',
        description:
          'Array of standard rate items. Items with id are updated (partial — only id + changed fields needed); ' +
          'items without id are created. Matches Postman "Update Standard Rates" payload.',
        items: { $ref: '#/components/schemas/StandardRateItem' },
        example: [
          {
            id: '{{existingStdRateId}}',
            stdRateValue: 70000,
            alertThresold: 75000,
          },
        ],
      },
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
            displayName: { type: 'object', example: { en: 'TMT Rebars' } },
            code: { type: 'string', example: 'TMT_REBARS' },
            productType: {
              type: 'string',
              enum: ['RAW_MATERIAL', 'FINISHED_PRODUCT'],
              example: 'RAW_MATERIAL',
            },
            searchText: { type: 'string', example: 'tmt rebars' },
            domainId: { type: 'string', format: 'uuid' },
            status: { type: 'string', example: 'ACTIVE' },
            isDeleted: { type: 'boolean', example: false },
            gradesCount: {
              type: 'integer',
              example: 3,
              description: 'Count of active product grades.',
            },
            uomsCount: {
              type: 'integer',
              example: 2,
              description: 'Count of active UOMs assigned to the product.',
            },
            gradeIds: {
              type: 'array',
              description:
                'Active product grade IDs. Use one as productGradeId for RMPR and related APIs.',
              items: { type: 'string', format: 'uuid' },
              example: [
                '175722fe-65a3-4f7d-9940-b9672c4122ba',
                'c5998139-d145-4a50-b7d7-48dc46342348',
              ],
            },
            uomIds: {
              type: 'array',
              description:
                'Active UOM IDs assigned to the product. Use one as uomId for RMPR and related APIs.',
              items: { type: 'string', format: 'uuid' },
              example: ['c3229ef5-df0f-4ae4-a494-6864849640b2'],
            },
            standardRateIds: {
              type: 'array',
              description: 'Active standard rate IDs from the product grades.',
              items: { type: 'string', format: 'uuid' },
              example: ['8fbdbf4f-b112-4a5f-b3ee-63a81abc2d99'],
            },
            inventories: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  quantity: { type: 'number', example: 1000 },
                  reorderLevel: { type: 'number', example: 100 },
                  status: { type: 'string', example: 'ACTIVE' },
                  createdAt: { type: 'string', format: 'date-time' },
                  productId: { type: 'string', format: 'uuid' },
                  productGradeId: { type: 'string', format: 'uuid' },
                  uomId: { type: 'string', format: 'uuid' },
                  productGrade: {
                    type: 'object',
                    nullable: true,
                    properties: {
                      id: { type: 'string', format: 'uuid' },
                      gradeDisplayName: {
                        oneOf: [{ type: 'object' }, { type: 'string' }],
                        example: 'Grade A - Premium',
                      },
                      gradeCode: { type: 'string', example: 'GRADE_A' },
                    },
                  },
                  uom: {
                    type: 'object',
                    nullable: true,
                    properties: {
                      id: { type: 'string', format: 'uuid' },
                      displayName: {
                        oneOf: [{ type: 'object' }, { type: 'string' }],
                        example: 'Kilogram',
                      },
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
  },

  ProductDetailResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Product retrieved' },
      data: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          displayName: { type: 'object', example: { en: 'TMT Rebars' } },
          code: { type: 'string', example: 'TMT_REBARS' },
          productType: {
            type: 'string',
            enum: ['RAW_MATERIAL', 'FINISHED_PRODUCT'],
            example: 'RAW_MATERIAL',
          },
          status: { type: 'string', example: 'active' },
          productGrades: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                gradeDisplayName: {
                  type: 'object',
                  example: { en: 'Grade 500D' },
                },
                gradeCode: { type: 'string', example: 'GRADE_500D' },
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
                      stdRateValue: { type: 'number', example: 65000 },
                      alertThresold: { type: 'number', example: 70000 },
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
                          displayName: {
                            type: 'object',
                            example: { en: 'Kilogram' },
                          },
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
                    displayName: {
                      type: 'object',
                      example: { en: 'Kilogram' },
                    },
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
                stdRateType: {
                  type: 'object',
                  example: { en: 'Purchase Rate' },
                },
                stdRateValue: { type: 'number', example: 65000 },
                alertThresold: { type: 'number', example: 70000 },
                status: { type: 'string', example: 'active' },
                createdAt: { type: 'string', format: 'date-time' },
                productGrade: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', format: 'uuid' },
                    gradeDisplayName: {
                      type: 'object',
                      example: { en: 'Grade 500D' },
                    },
                    gradeCode: { type: 'string', example: 'GRADE_500D' },
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
                    gradeDisplayName: {
                      type: 'object',
                      example: { en: 'Grade 500D' },
                    },
                    gradeCode: { type: 'string', example: 'GRADE_500D' },
                  },
                },
                uom: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', format: 'uuid' },
                    displayName: {
                      type: 'object',
                      example: { en: 'Kilogram' },
                    },
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
      gradeDisplayName: {
        type: 'object',
        description: 'Localized name',
        example: { en: 'Grade A' },
      },
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
      stdRateType: {
        type: 'object',
        description: 'Localized type',
        example: { en: 'Base Rate' },
      },
      stdRateValue: { type: 'number', example: 65000 },
      alertThresold: { type: 'number', example: 70000 },
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

  DomainProductGradesListResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: {
        type: 'string',
        example: 'Product grade retrieved successfully.',
      },
      data: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                gradeCode: { type: 'string', example: 'MS_ROD' },
                gradeDisplayName: { type: 'string', example: 'MS Rod' },
                product: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', format: 'uuid' },
                    code: { type: 'string', example: 'AGGRO_STEEL' },
                    displayName: { type: 'string', example: 'Aggro Steel' },
                  },
                },
              },
            },
          },
          total: { type: 'integer', example: 14 },
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 10 },
          totalPages: { type: 'integer', example: 2 },
        },
      },
    },
  },

  ProductGradesNestedStdRatesResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: {
        type: 'string',
        example: 'Product grade retrieved successfully.',
      },
      data: {
        type: 'object',
        properties: {
          product: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              code: { type: 'string', example: 'AGGRO_STEEL' },
              displayName: { type: 'string', example: 'Aggro Steel' },
            },
          },
          grades: {
            type: 'object',
            properties: {
              data: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', format: 'uuid' },
                    gradeCode: { type: 'string', example: 'FINAL_B' },
                    gradeDisplayName: {
                      type: 'string',
                      example: 'Final Grade B',
                    },
                    productGradeStdRates: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string', format: 'uuid' },
                          stdRateType: {
                            type: 'string',
                            example: 'Export Rate',
                          },
                          stdRateValue: { type: 'number', example: 90000 },
                        },
                      },
                    },
                  },
                },
              },
              total: { type: 'integer', example: 2 },
              page: { type: 'integer', example: 1 },
              limit: { type: 'integer', example: 10 },
              totalPages: { type: 'integer', example: 1 },
            },
          },
        },
      },
    },
  },
};
