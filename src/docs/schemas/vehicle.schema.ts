export const VehicleSchemas = {
  CreateVehicleBody: {
    type: 'object',
    required: ['numberPlate'],
    properties: {
      numberPlate: { type: 'string' },
      vehicleType: { type: 'string' },
      loadCapacity: { type: 'number' },
      loadCapacityUomId: { type: 'string' },
      alertLoadThreshold: { type: 'number' },
    },
  },
};
