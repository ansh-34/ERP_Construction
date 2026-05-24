export const DispatchSchemas = {
  CreateDispatchBody: {
    type: 'object',
    required: [
      'vehicleId',
      'journeyScheduleId',
      'actualFuelValue',
      'journeyStatus',
    ],
    properties: {
      vehicleId: {
        type: 'string',
        format: 'uuid',
        example: '662297d7-d842-4133-8500-5d43532c8e55',
      },
      journeyScheduleId: {
        type: 'string',
        format: 'uuid',
        example: 'ca6a772d-6e9b-4208-a7e5-0381da7bbddb',
      },
      description: {
        type: 'string',
        example: 'Dispatched from Mumbai depot',
      },
      actualFuelValue: { type: 'number', example: 22 },
      journeyStatus: { type: 'string', example: 'SCHEDULED' },
    },
  },

  DispatchObject: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        example: '61a920dc-9aac-42a9-8221-44d5f5bfbc7f',
      },
      vehicleId: {
        type: 'string',
        format: 'uuid',
        example: '662297d7-d842-4133-8500-5d43532c8e55',
      },
      code: { type: 'string', example: 'DV-25052026041431' },
      journeyScheduleId: {
        type: 'string',
        format: 'uuid',
        example: 'ca6a772d-6e9b-4208-a7e5-0381da7bbddb',
      },
      description: { type: 'string', nullable: true, example: null },
      date: {
        type: 'string',
        format: 'date-time',
        example: '2026-05-24T22:44:31.150Z',
      },
      driverName: { type: 'string', example: 'Rajesh Kumar' },
      startLocation: { type: 'string', example: 'Mumbai' },
      endLocation: { type: 'string', example: 'Pune' },
      distance: { type: 'number', example: 150 },
      average: { type: 'number', example: 45 },
      expectedFuelValue: { type: 'number', example: 25 },
      actualFuelValue: { type: 'number', example: 22 },
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
      journeyStatus: { type: 'string', example: 'SCHEDULED' },
      journeyStatusUpdatedAt: {
        type: 'string',
        format: 'date-time',
        example: '2026-05-24T22:44:31.150Z',
      },
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
        example: '2026-05-24T22:44:31.154Z',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        example: '2026-05-24T22:44:31.154Z',
      },
    },
  },

  DispatchListResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Dispatches retrieved' },
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
            { $ref: '#/components/schemas/DispatchObject' },
            {
              type: 'object',
              properties: {
                vehicle: {
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
                journeySchedule: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', format: 'uuid' },
                    code: {
                      type: 'string',
                      example: 'VJS-25052026041431',
                    },
                    startLocation: { type: 'string', example: 'Mumbai' },
                    endLocation: { type: 'string', example: 'Pune' },
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

  DispatchStatsResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Dispatch tracking stats retrieved' },
      data: {
        type: 'object',
        properties: {
          totalDispatches: { type: 'integer', example: 1 },
          journeyStatusBreakdown: {
            type: 'object',
            properties: {
              scheduled: { type: 'integer', example: 1 },
              inTransit: { type: 'integer', example: 0 },
              delivered: { type: 'integer', example: 0 },
              cancelled: { type: 'integer', example: 0 },
            },
          },
          loadingStatusBreakdown: {
            type: 'object',
            properties: {
              pending: { type: 'integer', example: 0 },
              loaded: { type: 'integer', example: 1 },
            },
          },
          totalLoadedQuantity: { type: 'number', example: 10000 },
          avgLoadedQuantity: { type: 'number', example: 10000 },
          totalDistance: { type: 'number', example: 150 },
          avgDistance: { type: 'number', example: 150 },
          fuelSummary: {
            type: 'object',
            properties: {
              totalExpectedFuel: { type: 'number', example: 25 },
              totalActualFuel: { type: 'number', example: 22 },
            },
          },
        },
      },
    },
  },
};
