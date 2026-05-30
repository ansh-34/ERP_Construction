const localizedObject = {
  type: 'object',
  additionalProperties: true,
  example: { en: 'Crusher belt inspection' },
};

const activeStatus = {
  type: 'string',
  enum: ['ACTIVE', 'INACTIVE'],
  example: 'ACTIVE',
};

const assetType = {
  type: 'string',
  enum: ['VEHICLE', 'MACHINERY'],
  example: 'MACHINERY',
};

const scheduleStatus = {
  type: 'string',
  enum: ['SCHEDULED', 'OVERDUE', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
  example: 'SCHEDULED',
};

export const MaintenanceScheduleSchemas = {
  MaintenanceScheduleObject: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      code: { type: 'string', example: 'MS-001' },
      title: localizedObject,
      assetType,
      vehicleId: { type: 'string', format: 'uuid', nullable: true },
      machineryId: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        example: '00000000-0000-0000-0000-000000000000',
      },
      vehicle: {
        type: 'object',
        nullable: true,
        additionalProperties: true,
      },
      machinery: {
        type: 'object',
        nullable: true,
        additionalProperties: true,
      },
      nextDueDate: { type: 'string', format: 'date-time' },
      scheduleStatus,
      domainId: { type: 'string', format: 'uuid' },
      adminId: { type: 'string', format: 'uuid' },
      status: activeStatus,
      isDeleted: { type: 'boolean', example: false },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  },
  CreateMaintenanceScheduleBody: {
    type: 'object',
    required: ['code', 'title', 'assetType', 'nextDueDate'],
    properties: {
      code: { type: 'string', example: 'MS-001' },
      title: localizedObject,
      assetType,
      vehicleId: { type: 'string', format: 'uuid', nullable: true },
      machineryId: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        example: '00000000-0000-0000-0000-000000000000',
      },
      nextDueDate: { type: 'string', example: '2026-06-10' },
      scheduleStatus,
      status: activeStatus,
    },
  },
  UpdateMaintenanceScheduleBody: {
    type: 'object',
    properties: {
      code: { type: 'string', example: 'MS-001' },
      title: localizedObject,
      assetType,
      vehicleId: { type: 'string', format: 'uuid', nullable: true },
      machineryId: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        example: '00000000-0000-0000-0000-000000000000',
      },
      nextDueDate: { type: 'string', example: '2026-07-10' },
      scheduleStatus,
      status: activeStatus,
    },
  },
  AdvanceMaintenanceScheduleBody: {
    type: 'object',
    required: ['nextDueDate'],
    properties: {
      nextDueDate: { type: 'string', example: '2026-07-10' },
      scheduleStatus,
    },
  },
};
