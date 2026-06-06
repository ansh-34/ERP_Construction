export const VendorProductPriceSchemas = {
  CreateVendorProductPriceRequest: {
    type: 'array',
    items: {
      type: 'object',
      required: ['productId', 'productGradeId', 'uomId', 'price', 'currencyId'],
      properties: {
        productId: {
          type: 'string',
          format: 'uuid',
        },
        productGradeId: {
          type: 'string',
          format: 'uuid',
        },
        uomId: {
          type: 'string',
          format: 'uuid',
        },
        currencyId: {
          type: 'string',
          format: 'uuid',
        },
        price: {
          type: 'number',
          minimum: 0,
          example: 150.5,
        },
      },
    },
  },

  UpdateVendorProductPriceRequest: {
    type: 'array',
    items: {
      type: 'object',
      required: ['vendorProductPriceId', 'uomId', 'currencyId', 'price'],
      properties: {
        vendorProductPriceId: {
          type: 'string',
          format: 'uuid',
        },
        uomId: {
          type: 'string',
          format: 'uuid',
        },
        currencyId: {
          type: 'string',
          format: 'uuid',
        },
        price: {
          type: 'number',
          minimum: 0,
          example: 150.5,
        },
      },
    },
  },

  VendorProductPriceObject: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
      },

      vendorId: {
        type: 'string',
        format: 'uuid',
      },

      productId: {
        type: 'string',
        format: 'uuid',
      },

      productGradeId: {
        type: 'string',
        format: 'uuid',
      },

      uomId: {
        type: 'string',
        format: 'uuid',
      },

      currencyId: {
        type: 'string',
        format: 'uuid',
      },

      price: {
        type: 'number',
        example: 150.5,
      },

      status: {
        type: 'string',
        example: 'ACTIVE',
      },

      product: {
        type: 'object',
        properties: {
          displayName: {
            type: 'string',
            example: 'Ultra Cement',
          },
          code: {
            type: 'string',
            example: 'ULTRA_CEMENT',
          },
        },
      },

      productGrade: {
        type: 'object',
        properties: {
          gradeDisplayName: {
            type: 'string',
            example: 'Grade A - Premium',
          },
          gradeCode: {
            type: 'string',
            example: 'GRADE_A',
          },
        },
      },

      uom: {
        type: 'object',
        properties: {
          displayName: {
            type: 'string',
            example: 'Liters',
          },
          code: {
            type: 'string',
            example: 'LTR',
          },
        },
      },

      vendor: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
          },
          email: {
            type: 'string',
          },
          contactPerson: {
            type: 'string',
          },
        },
      },

      currency: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            example: 'Dollar',
          },
          code: {
            type: 'string',
            example: 'DOLLAR',
          },
          symbol: {
            type: 'string',
            example: '$',
          },
        },
      },

      createdAt: {
        type: 'string',
        format: 'date-time',
      },

      updatedAt: {
        type: 'string',
        format: 'date-time',
      },
    },
  },
};

export const UserProductPriceSchemas = {
  CreateUserProductPriceRequest: {
    $ref: '#/components/schemas/CreateVendorProductPriceRequest',
  },

  UpdateUserProductPriceRequest: {
    $ref: '#/components/schemas/UpdateVendorProductPriceRequest',
  },

  UserProductPriceObject: {
    type: 'object',

    properties: {
      id: {
        type: 'string',
        format: 'uuid',
      },

      userId: {
        type: 'string',
        format: 'uuid',
      },

      productId: {
        type: 'string',
        format: 'uuid',
      },

      productGradeId: {
        type: 'string',
        format: 'uuid',
      },

      uomId: {
        type: 'string',
        format: 'uuid',
      },

      currencyId: {
        type: 'string',
        format: 'uuid',
      },

      price: {
        type: 'number',
        example: 150.5,
      },

      status: {
        type: 'string',
        example: 'ACTIVE',
      },

      product: {
        type: 'object',
        properties: {
          displayName: {
            type: 'string',
            example: 'Ultra Cement',
          },
          code: {
            type: 'string',
            example: 'ULTRA_CEMENT',
          },
        },
      },

      productGrade: {
        type: 'object',
        properties: {
          gradeDisplayName: {
            type: 'string',
            example: 'Grade A - Premium',
          },
          gradeCode: {
            type: 'string',
            example: 'GRADE_A',
          },
        },
      },

      uom: {
        type: 'object',
        properties: {
          displayName: {
            type: 'string',
            example: 'Liters',
          },
          code: {
            type: 'string',
            example: 'LTR',
          },
        },
      },

      user: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
          },
          email: {
            type: 'string',
          },
        },
      },

      currency: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            example: 'Dollar',
          },
          code: {
            type: 'string',
            example: 'DOLLAR',
          },
          symbol: {
            type: 'string',
            example: '$',
          },
        },
      },

      createdAt: {
        type: 'string',
        format: 'date-time',
      },

      updatedAt: {
        type: 'string',
        format: 'date-time',
      },
    },
  },
};
