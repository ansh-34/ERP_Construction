export const MaintenanceReportSchemas = {
  MaintenanceReportObject: {
    type: 'object',
    properties: {
      groupBy: { type: 'string', enum: ['DAY', 'WEEK', 'MONTH', 'YEAR'] },
      summary: {
        type: 'object',
        properties: {
          totalExpense: { type: 'number', example: 128400 },
          vehicleExpense: { type: 'number', example: 55200 },
          machineryExpense: { type: 'number', example: 73200 },
          totalLogs: { type: 'integer', example: 7 },
        },
      },
      periodComparison: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            period: { type: 'string', example: '2026-01' },
            vehicleExpense: { type: 'number', example: 14300 },
            machineryExpense: { type: 'number', example: 16800 },
            totalExpense: { type: 'number', example: 31100 },
            logCount: { type: 'integer', example: 2 },
            delta: { type: 'number', example: 31100 },
          },
        },
      },
      assetExpenses: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            assetType: { type: 'string', enum: ['VEHICLE', 'MACHINERY'] },
            assetId: { type: 'string', format: 'uuid' },
            assetCode: { type: 'string', example: 'EXC-01' },
            expense: { type: 'number', example: 38400 },
            logCount: { type: 'integer', example: 1 },
          },
        },
      },
    },
  },
};
