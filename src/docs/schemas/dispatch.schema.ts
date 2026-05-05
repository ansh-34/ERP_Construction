export const DispatchSchemas = {
  CreateDispatchBody: {
    type: 'object',
    required: ['vehicleId', 'code'],
    properties: {
      vehicleId: { type: 'string', format: 'uuid' },
      code: { type: 'string', example: 'DSP-042' },
      journeyScheduleId: { type: 'string', format: 'uuid' },
      description: { type: 'string' },
      date: { type: 'string', format: 'date-time' },
      driverName: { type: 'string', example: 'Ramesh' },
      startLocation: { type: 'string', example: 'Quarry A' },
      endLocation: { type: 'string', example: 'Site B' },
      distance: { type: 'number', example: 120 },
      average: { type: 'number', example: 35 },
      expectedFuelValue: { type: 'number', example: 45 },
      actualFuelValue: { type: 'number', example: 48 },
      fuelAlertThreshold: { type: 'number', example: 50 },
      loadedQuantity: { type: 'number', example: 4200 },
      loadedQuantityUomId: { type: 'string', format: 'uuid' },
      loadedAt: { type: 'string', format: 'date-time' },
      loadingStatus: {
        type: 'string',
        example: 'PENDING',
        enum: ['PENDING', 'LOADED'],
      },
      journeyStatus: {
        type: 'string',
        example: 'SCHEDULED',
        enum: ['SCHEDULED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'],
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
          totalDispatches: { type: 'integer', example: 80 },
          journeyStatusBreakdown: {
            type: 'object',
            properties: {
              scheduled: { type: 'integer', example: 20 },
              inTransit: { type: 'integer', example: 15 },
              delivered: { type: 'integer', example: 40 },
              cancelled: { type: 'integer', example: 5 },
            },
          },
          loadingStatusBreakdown: {
            type: 'object',
            properties: {
              pending: { type: 'integer', example: 25 },
              loaded: { type: 'integer', example: 55 },
            },
          },
          totalLoadedQuantity: { type: 'number', example: 18000 },
          avgLoadedQuantity: { type: 'number', example: 225 },
          totalDistance: { type: 'number', example: 12000 },
          avgDistance: { type: 'number', example: 150 },
          fuelSummary: {
            type: 'object',
            properties: {
              totalExpectedFuel: { type: 'number', example: 5000 },
              totalActualFuel: { type: 'number', example: 5400 },
            },
          },
        },
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
          currentCount: { type: 'integer', example: 10 },
          totalCount: { type: 'integer', example: 80 },
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
            code: { type: 'string', example: 'DSP-042' },
            description: { type: 'string', nullable: true },
            driverName: { type: 'string', example: 'Ramesh' },
            startLocation: { type: 'string', example: 'Quarry A' },
            endLocation: { type: 'string', example: 'Site B' },
            distance: { type: 'number', example: 120 },
            loadedQuantity: { type: 'number', example: 4200 },
            loadingStatus: { type: 'string', example: 'LOADED' },
            journeyStatus: { type: 'string', example: 'IN_TRANSIT' },
            journeyStatusUpdatedAt: { type: 'string', format: 'date-time' },
            actualFuelValue: { type: 'number', example: 48 },
            expectedFuelValue: { type: 'number', example: 45 },
            vehicle: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                numberPlate: { type: 'string', example: 'MH-12-AB-1234' },
                vehicleType: { type: 'string', example: 'TRUCK' },
              },
            },
            journeySchedule: {
              type: 'object',
              nullable: true,
              properties: {
                id: { type: 'string', format: 'uuid' },
                code: { type: 'string', example: 'JS-001' },
                startLocation: { type: 'string', example: 'Quarry A' },
                endLocation: { type: 'string', example: 'Site B' },
              },
            },
            loadedQuantityUom: { type: 'object', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  },
};
