export const JourneyScheduleSchemas = {
  CreateJourneyScheduleBody: {
    type: 'object',
    required: [
      'truckId',
      'code',
      'date',
      'driverName',
      'startLocation',
      'endLocation',
      'distance',
      'average',
      'expectedFuelValue',
      'fuelAlertThreshold',
      'loadedAt',
      'loadingStatus',
    ],
    properties: {
      truckId: {
        type: 'string',
        format: 'uuid',
        example: '662297d7-d842-4133-8500-5d43532c8e55',
      },
      code: { type: 'string', example: 'VJS-25052026041431' },
      description: { type: 'string', example: 'Load from Mumbai depot' },
      date: {
        type: 'string',
        format: 'date-time',
        example: '2026-05-24T22:44:31.063Z',
      },
      driverName: { type: 'string', example: 'Rajesh Kumar' },
      startLocation: { type: 'string', example: 'Mumbai' },
      endLocation: { type: 'string', example: 'Pune' },
      distance: { type: 'number', example: 150 },
      average: { type: 'number', example: 45 },
      expectedFuelValue: { type: 'number', example: 25 },
      fuelAlertThreshold: { type: 'number', example: 5 },
      loadedQuantity: { type: 'number', example: 10000 },
      loadedQuantityUomId: {
        type: 'string',
        format: 'uuid',
        example: '0e026814-95d6-4100-8afd-5b8f2dda6d5f',
      },
      loadedAt: {
        type: 'string',
        format: 'date-time',
        example: '2026-05-24T22:44:31.063Z',
      },
      loadingStatus: { type: 'string', example: 'LOADED' },
    },
  },

  JourneyScheduleObject: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        example: 'ca6a772d-6e9b-4208-a7e5-0381da7bbddb',
      },
      truckId: {
        type: 'string',
        format: 'uuid',
        example: '662297d7-d842-4133-8500-5d43532c8e55',
      },
      code: { type: 'string', example: 'VJS-25052026041431' },
      description: { type: 'string', nullable: true, example: null },
      date: {
        type: 'string',
        format: 'date-time',
        example: '2026-05-24T22:44:31.063Z',
      },
      driverName: { type: 'string', example: 'Rajesh Kumar' },
      startLocation: { type: 'string', example: 'Mumbai' },
      endLocation: { type: 'string', example: 'Pune' },
      distance: { type: 'number', example: 150 },
      average: { type: 'number', example: 45 },
      expectedFuelValue: { type: 'number', example: 25 },
      fuelAlertThreshold: { type: 'number', example: 5 },
      loadedQuantity: { type: 'number', example: 10000 },
      loadedQuantityUomId: {
        type: 'string',
        format: 'uuid',
        example: '0e026814-95d6-4100-8afd-5b8f2dda6d5f',
      },
      loadedAt: {
        type: 'string',
        format: 'date-time',
        example: '2026-05-24T22:44:31.063Z',
      },
      loadingStatus: { type: 'string', example: 'LOADED' },
      domainId: {
        type: 'string',
        format: 'uuid',
        example: 'd7ef8519-601e-4675-add6-27f762cb0aa4',
      },
      status: { type: 'string', example: 'ACTIVE' },
      isDeleted: { type: 'boolean', example: false },
      createdAt: {
        type: 'string',
        format: 'date-time',
        example: '2026-05-24T22:44:31.089Z',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        example: '2026-05-24T22:44:31.089Z',
      },
    },
  },

  JourneyScheduleListResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Journey schedules retrieved' },
      pagination: {
        type: 'object',
        properties: {
          currentCount: { type: 'integer', example: 1 },
          totalCount: { type: 'integer', example: 1 },
          offset: { type: 'integer', example: 0 },
          limit: { type: 'integer', example: 10 },
        },
      },
      data: {
        type: 'array',
        items: {
          allOf: [
            { $ref: '#/components/schemas/JourneyScheduleObject' },
            {
              type: 'object',
              properties: {
                truck: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', format: 'uuid' },
                    numberPlate: {
                      type: 'string',
                      example: 'MH-12-AB-1234',
                    },
                    vehicleType: { type: 'string', example: 'TRUCK' },
                  },
                },
                loadedQuantityUom: {
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
          ],
        },
      },
    },
  },

  JourneyScheduleStatsResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: {
        type: 'string',
        example: 'Truck load monitor stats retrieved',
      },
      data: {
        type: 'object',
        properties: {
          totalSchedules: { type: 'integer', example: 1 },
          loadingStatusBreakdown: {
            type: 'object',
            properties: {
              pending: { type: 'integer', example: 0 },
              loaded: { type: 'integer', example: 1 },
              inTransit: { type: 'integer', example: 0 },
            },
          },
          totalLoadedQuantity: { type: 'number', example: 10000 },
          avgLoadedQuantity: { type: 'number', example: 10000 },
          totalDistance: { type: 'number', example: 150 },
          avgDistance: { type: 'number', example: 150 },
          totalExpectedFuel: { type: 'number', example: 25 },
        },
      },
    },
  },
};
