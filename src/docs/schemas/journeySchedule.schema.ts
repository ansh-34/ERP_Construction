export const JourneyScheduleSchemas = {
  CreateJourneyScheduleBody: {
    type: 'object',
    required: ['truckId', 'code'],
    properties: {
      truckId: { type: 'string', format: 'uuid' },
      code: { type: 'string', example: 'JS-001' },
      description: { type: 'string' },
      date: { type: 'string', format: 'date-time' },
      driverName: { type: 'string', example: 'Ramesh' },
      startLocation: { type: 'string', example: 'Quarry A' },
      endLocation: { type: 'string', example: 'Site B' },
      distance: { type: 'number', example: 120 },
      average: { type: 'number', example: 35 },
      expectedFuelValue: { type: 'number', example: 45 },
      fuelAlertThreshold: { type: 'number', example: 50 },
      loadedQuantity: { type: 'number', example: 4200 },
      loadedQuantityUomId: { type: 'string', format: 'uuid' },
      loadedAt: { type: 'string', format: 'date-time' },
      loadingStatus: { type: 'string', example: 'PENDING', enum: ['PENDING', 'LOADED', 'IN_TRANSIT'] },
    },
  },
  JourneyScheduleStatsResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Truck load monitor stats retrieved' },
      data: {
        type: 'object',
        properties: {
          totalSchedules: { type: 'integer', example: 50 },
          loadingStatusBreakdown: {
            type: 'object',
            properties: {
              pending: { type: 'integer', example: 15 },
              loaded: { type: 'integer', example: 30 },
              inTransit: { type: 'integer', example: 5 },
            },
          },
          totalLoadedQuantity: { type: 'number', example: 12500 },
          avgLoadedQuantity: { type: 'number', example: 250 },
          totalDistance: { type: 'number', example: 8400 },
          avgDistance: { type: 'number', example: 168 },
          totalExpectedFuel: { type: 'number', example: 3200 },
        },
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
          currentCount: { type: 'integer', example: 10 },
          totalCount: { type: 'integer', example: 50 },
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
            code: { type: 'string', example: 'JS-001' },
            description: { type: 'string', nullable: true },
            driverName: { type: 'string', example: 'Ramesh' },
            startLocation: { type: 'string', example: 'Quarry A' },
            endLocation: { type: 'string', example: 'Site B' },
            distance: { type: 'number', example: 120 },
            loadedQuantity: { type: 'number', example: 4200 },
            loadedAt: { type: 'string', format: 'date-time' },
            loadingStatus: { type: 'string', example: 'LOADED' },
            expectedFuelValue: { type: 'number', example: 45 },
            date: { type: 'string', format: 'date-time' },
            truck: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                numberPlate: { type: 'string', example: 'MH-12-AB-1234' },
                vehicleType: { type: 'string', example: 'TRUCK' },
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
