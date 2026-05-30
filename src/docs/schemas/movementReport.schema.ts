export const MovementReportSchemas = {
  MovementReportObject: {
    type: 'object',
    properties: {
      summary: {
        type: 'object',
        properties: {
          totalMovements: { type: 'integer', example: 3 },
          totalHours: { type: 'number', example: 28 },
          totalMeterUsage: { type: 'number', example: 42 },
          vehicleMovements: { type: 'integer', example: 1 },
          machineryMovements: { type: 'integer', example: 2 },
        },
      },
      hoursByProjectSite: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            projectId: { type: 'string', format: 'uuid', nullable: true },
            projectCode: { type: 'string', example: 'MINE-A' },
            projectName: {
              oneOf: [{ type: 'string' }, { type: 'object' }],
            },
            hours: { type: 'number', example: 10.5 },
            movements: { type: 'integer', example: 1 },
            meterUsage: { type: 'number', example: 14 },
          },
        },
      },
      hoursByMovementType: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            movementType: { type: 'string', example: 'WAREHOUSE_TO_SITE' },
            hours: { type: 'number', example: 10.5 },
            movements: { type: 'integer', example: 1 },
            meterUsage: { type: 'number', example: 14 },
          },
        },
      },
      assetUsage: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            assetType: { type: 'string', enum: ['VEHICLE', 'MACHINERY'] },
            assetId: { type: 'string', format: 'uuid' },
            assetCode: { type: 'string', example: 'CRUSHER-01' },
            hours: { type: 'number', example: 10.5 },
            movements: { type: 'integer', example: 1 },
            meterUsage: { type: 'number', example: 14 },
          },
        },
      },
    },
  },
};
