const localizedObject = {
  type: 'object',
  additionalProperties: true,
  example: { en: 'Sample name' },
};

const activeStatus = {
  type: 'string',
  enum: ['ACTIVE', 'INACTIVE'],
  example: 'ACTIVE',
  description: 'Allowed values: ACTIVE, INACTIVE',
};

const taskStatus = {
  type: 'string',
  example: 'PENDING',
  description:
    'Task workflow status. Common values: PENDING, IN_PROGRESS, COMPLETED.',
};

export const ProjectSchemas = {
  ProjectObject: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      name: localizedObject,
      description: { ...localizedObject, nullable: true },
      budget: { type: 'number', example: 100000 },
      spent: { type: 'number', example: 25000 },
      locationId: { type: 'string', format: 'uuid' },
      domainId: { type: 'string', format: 'uuid' },
      status: activeStatus,
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  },
  CreateProjectBody: {
    type: 'object',
    required: ['name', 'budget', 'locationId'],
    properties: {
      name: localizedObject,
      description: { ...localizedObject, nullable: true },
      budget: { type: 'number', minimum: 0, example: 100000 },
      spent: { type: 'number', minimum: 0, example: 0 },
      locationId: { type: 'string', format: 'uuid' },
      status: activeStatus,
    },
  },
  UpdateProjectBody: {
    type: 'object',
    properties: {
      name: localizedObject,
      description: { ...localizedObject, nullable: true },
      budget: { type: 'number', minimum: 0 },
      spent: { type: 'number', minimum: 0 },
      status: activeStatus,
    },
  },
  ProjectStageObject: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      name: localizedObject,
      description: { ...localizedObject, nullable: true },
      progress: { type: 'number', example: 35 },
      projectId: { type: 'string', format: 'uuid' },
      domainId: { type: 'string', format: 'uuid' },
      status: activeStatus,
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  },
  CreateProjectStageBody: {
    type: 'object',
    required: ['name', 'projectId'],
    properties: {
      name: localizedObject,
      description: { ...localizedObject, nullable: true },
      progress: { type: 'number', minimum: 0, nullable: true, example: 0 },
      projectId: { type: 'string', format: 'uuid' },
      status: activeStatus,
    },
  },
  ProjectTaskObject: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      name: localizedObject,
      assignee: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'User ID assigned to this task.',
      },
      plannedStartDate: {
        type: 'string',
        nullable: true,
        example: '2026-05-18',
      },
      plannedEndDate: { type: 'string', nullable: true, example: '2026-05-25' },
      taskStatus,
      taskProgress: { type: 'number', example: 20 },
      requiredApproval: { type: 'boolean', example: false },
      stageId: { type: 'string', format: 'uuid' },
      projectId: { type: 'string', format: 'uuid' },
      domainId: { type: 'string', format: 'uuid' },
      status: activeStatus,
    },
  },
  CreateProjectTaskBody: {
    type: 'object',
    required: ['name', 'stageId', 'projectId'],
    properties: {
      name: localizedObject,
      assignee: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'User ID assigned to this task.',
      },
      plannedStartDate: {
        type: 'string',
        nullable: true,
        example: '2026-05-18',
      },
      plannedEndDate: { type: 'string', nullable: true, example: '2026-05-25' },
      taskStatus,
      taskProgress: { type: 'number', minimum: 0, example: 0 },
      totalDelayInDays: { type: 'number', minimum: 0, example: 0 },
      requiredApproval: { type: 'boolean', example: false },
      projectBatchCode: {
        type: 'string',
        nullable: true,
        example: 'BATCH-001',
      },
      stageId: { type: 'string', format: 'uuid' },
      projectId: { type: 'string', format: 'uuid' },
      status: activeStatus,
    },
  },
  ProjectTaskDelayObject: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      taskId: { type: 'string', format: 'uuid' },
      requestedDelayInDays: { type: 'number', example: 2 },
      delayReason: {
        type: 'string',
        example: 'Material delivery was delayed.',
        description: 'Single language delay reason.',
      },
      requestApproved: {
        type: 'boolean',
        example: false,
        description: 'false means pending, true means approved.',
      },
      approvalState: {
        type: 'string',
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        example: 'PENDING',
        description:
          'Computed state. PENDING when requestApproved is false and requestApprovalTime is empty.',
      },
      requestApprovalTime: { type: 'string', nullable: true },
      stageId: { type: 'string', format: 'uuid' },
      projectId: { type: 'string', format: 'uuid' },
      domainId: { type: 'string', format: 'uuid' },
      status: activeStatus,
    },
  },
  CreateProjectTaskDelayBody: {
    type: 'object',
    required: [
      'taskId',
      'requestedDelayInDays',
      'delayReason',
      'stageId',
      'projectId',
    ],
    properties: {
      taskId: { type: 'string', format: 'uuid' },
      requestedDelayInDays: { type: 'number', minimum: 0, example: 2 },
      delayReason: {
        type: 'string',
        example: 'Material delivery was delayed.',
        description: 'Single language delay reason.',
      },
      requestApproved: {
        type: 'boolean',
        example: false,
        description: 'Allowed values: false = PENDING, true = APPROVED.',
      },
      requestApprovalTime: { type: 'string', nullable: true },
      stageId: { type: 'string', format: 'uuid' },
      projectId: { type: 'string', format: 'uuid' },
      status: activeStatus,
    },
  },
  MachineryObject: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      code: { type: 'string', example: 'MCH-001' },
      type: localizedObject,
      expectedLitrePerHour: { type: 'number', example: 12 },
      projectId: { type: 'string', format: 'uuid' },
      domainId: { type: 'string', format: 'uuid' },
      status: activeStatus,
    },
  },
  MachineReadingObject: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      date: { type: 'string', example: '2026-05-18' },
      openingFuelStock: { type: 'number', example: 100 },
      closingFuelStock: { type: 'number', example: 80 },
      fuelRefillQuantity: { type: 'number', example: 20 },
      machineStartTime: { type: 'string', example: '09:00' },
      machineEndTime: { type: 'string', example: '18:00' },
      projectId: { type: 'string', format: 'uuid' },
      status: { type: 'string', example: 'ACTIVE' },
    },
  },
  CurrencyObject: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      name: { type: 'object', example: { en: 'US Dollar' } },
      symbol: { type: 'string', example: '$' },
      flag: { type: 'string', example: 'https://flagcdn.com/w40/us.png' },
      status: { type: 'string', example: 'active' },
    },
  },
  UserCurrencyObject: {
    type: 'object',
    properties: {
      userRelationalId: {
        type: 'string',
        format: 'uuid',
        description: 'Currency ID exposed for the user module response.',
      },
      name: { type: 'string', example: 'US Dollar' },
      code: { type: 'string', example: 'DOLLAR' },
      symbol: { type: 'string', example: '$' },
      flag: { type: 'string', example: 'https://flagcdn.com/w40/us.png' },
      status: { type: 'string', example: 'active' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  },
};
