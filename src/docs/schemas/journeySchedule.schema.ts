export const JourneyScheduleSchemas = {
  CreateJourneyScheduleBody: {
    type: 'object',
    required: ['truckId', 'code'],
    properties: {
      truckId: { type: 'string' },
      code: { type: 'string' },
      description: { type: 'string' },
      date: { type: 'string' },
      driverName: { type: 'string' },
      startLocation: { type: 'string' },
      endLocation: { type: 'string' },
      distance: { type: 'number' },
      average: { type: 'number' },
      expectedFuelValue: { type: 'number' },
      fuelAlertThreshold: { type: 'number' },
      loadedQuantity: { type: 'number' },
      loadedQuantityUomId: { type: 'string' },
      loadedAt: { type: 'string' },
      loadingStatus: { type: 'string' },
    },
  },
};
