export const MaintenanceLogSchemas = {
  MaintenanceLogObject: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      code: { type: 'string', example: 'ML-001' },
      date: { type: 'string', format: 'date', example: '2026-06-12' },
      description: {
        oneOf: [
          { type: 'string', example: 'Crusher jaw plate replacement' },
          {
            type: 'object',
            additionalProperties: { type: 'string' },
            example: { en: 'Crusher jaw plate replacement' },
          },
        ],
      },
      assetType: {
        type: 'string',
        enum: ['VEHICLE', 'MACHINERY'],
        example: 'MACHINERY',
      },
      vehicleId: { type: 'string', format: 'uuid', nullable: true },
      machineryId: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        example: '00000000-0000-0000-0000-000000000000',
      },
      maintenanceScheduleId: {
        type: 'string',
        format: 'uuid',
        nullable: true,
      },
      expenseAmount: { type: 'number', example: 64200 },
      meterReading: { type: 'number', nullable: true, example: 814 },
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
        example: { en: 'Crusher jaw plate replacement' },
      },
      assetType: {
        type: 'string',
        enum: ['VEHICLE', 'MACHINERY'],
        example: 'MACHINERY',
      },
      vehicleId: { type: 'string', format: 'uuid', nullable: true },
      machineryId: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        example: '00000000-0000-0000-0000-000000000000',
      },
      maintenanceScheduleId: {
        type: 'string',
        format: 'uuid',
        nullable: true,
      },
      expenseAmount: { type: 'number', minimum: 0, example: 64200 },
      meterReading: {
        type: 'number',
        minimum: 0,
        nullable: true,
        example: 814,
      },
      status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
    },
  },
};
