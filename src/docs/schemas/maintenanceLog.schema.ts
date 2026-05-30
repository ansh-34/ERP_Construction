export const MaintenanceLogSchemas = {
  MaintenanceLogObject: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      code: { type: 'string', example: 'ML-001' },
      date: { type: 'string', format: 'date', example: '2026-06-12' },
      description: {
        oneOf: [
          { type: 'string', example: 'Engine oil change and brake service' },
          {
            type: 'object',
            additionalProperties: { type: 'string' },
            example: { en: 'Engine oil change and brake service' },
          },
        ],
      },
      assetType: { type: 'string', enum: ['VEHICLE', 'MACHINERY'] },
      vehicleId: { type: 'string', format: 'uuid', nullable: true },
      machineryId: { type: 'string', format: 'uuid', nullable: true },
      maintenanceScheduleId: {
        type: 'string',
        format: 'uuid',
        nullable: true,
      },
      expenseAmount: { type: 'number', example: 18500 },
      meterReading: { type: 'number', nullable: true, example: 145220 },
      domainId: { type: 'string', format: 'uuid' },
      adminId: { type: 'string', format: 'uuid' },
      vehicle: { type: 'object', nullable: true },
      machinery: { type: 'object', nullable: true },
      maintenanceSchedule: { type: 'object', nullable: true },
      status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
      isDeleted: { type: 'boolean' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  },
  CreateMaintenanceLogBody: {
    type: 'object',
    required: ['code', 'date', 'description', 'assetType'],
    properties: {
      code: { type: 'string', example: 'ML-001' },
      date: { type: 'string', format: 'date', example: '2026-06-12' },
      description: {
        type: 'object',
        additionalProperties: { type: 'string' },
        example: { en: 'Engine oil change and brake service' },
      },
      assetType: { type: 'string', enum: ['VEHICLE', 'MACHINERY'] },
      vehicleId: { type: 'string', format: 'uuid', nullable: true },
      machineryId: { type: 'string', format: 'uuid', nullable: true },
      maintenanceScheduleId: {
        type: 'string',
        format: 'uuid',
        nullable: true,
      },
      expenseAmount: { type: 'number', minimum: 0, example: 18500 },
      meterReading: { type: 'number', minimum: 0, nullable: true },
      status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
    },
  },
};
