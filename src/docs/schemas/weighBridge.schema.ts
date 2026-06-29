const WeighBridgeObject = {
  type: 'object',
  properties: {
    id: {
      type: 'string',
      format: 'uuid',
      example: 'adda24da-6aba-48dd-bb49-addcb06e7f03',
    },
    ticketNumber: {
      type: 'string',
      description:
        'Auto-generated as WB-0001, WB-0002 … unless explicitly sent',
      example: 'WB-0003',
    },
    date: {
      type: 'string',
      format: 'date-time',
      example: '2026-06-27T06:23:04.958Z',
    },
    driverName: { type: 'string', example: 'Rajesh Kumar' },
    vehicleNo: { type: 'string', example: 'GJ01AB1234' },
    supplier: { type: 'string', example: 'Steel Corp India' },
    material: { type: 'string', example: 'Iron Ore' },
    gateNoteNo: { type: 'string', example: 'GN-2026-001' },
    tareWeight: { type: 'string', example: '8500' },
    grossWeight: { type: 'string', example: '25000' },
    weighBridgeStatus: { type: 'string', example: 'PENDING' },
    operatorId: {
      type: 'string',
      format: 'uuid',
      example: '91e4f3c9-2a20-4de4-9e00-8ccf2f2f1998',
    },
    operatorName: {
      type: 'string',
      description: 'Auto-filled from the User table using operatorId',
      example: 'Test User',
    },
    remarks: {
      type: 'string',
      nullable: true,
      example: 'First weighbridge entry',
    },
    projectId: {
      type: 'string',
      format: 'uuid',
      nullable: true,
      example: '88888888-8888-8888-8888-888888888801',
    },
    domainId: {
      type: 'string',
      format: 'uuid',
      example: '32549b13-9fb7-44da-8f70-d943d997f956',
    },
    adminId: {
      type: 'string',
      format: 'uuid',
      example: '1da16956-db58-4216-81f1-30ca54876913',
    },
    status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'], example: 'ACTIVE' },
    isDeleted: { type: 'boolean', example: false },
    createdAt: {
      type: 'string',
      format: 'date-time',
      example: '2026-06-27T06:23:04.960Z',
    },
    updatedAt: {
      type: 'string',
      format: 'date-time',
      example: '2026-06-27T06:23:04.960Z',
    },
    project: {
      type: 'object',
      nullable: true,
      properties: {
        id: { type: 'string', format: 'uuid' },
        name: { type: 'object', example: { en: 'Test Project' } },
        code: { type: 'string', example: 'PROJ-1' },
      },
    },
    operator: {
      type: 'object',
      nullable: true,
      properties: {
        id: { type: 'string', format: 'uuid' },
        name: { type: 'string', example: 'Test User' },
        email: { type: 'string', example: 'user@example.com' },
      },
    },
  },
};

export const WeighBridgeSchemas = {
  WeighBridgeObject,

  WeighBridgeCreateBody: {
    type: 'object',
    description:
      'ticketNumber is auto-generated (WB-0001, WB-0002 …) unless sent. operatorName is auto-filled from the User table via operatorId — do NOT send it.',
    required: [
      'driverName',
      'vehicleNo',
      'supplier',
      'material',
      'gateNoteNo',
      'tareWeight',
      'grossWeight',
      'operatorId',
    ],
    properties: {
      ticketNumber: {
        type: 'string',
        description: 'Optional — auto-generated if omitted',
        example: 'WB-0003',
      },
      date: { type: 'string', format: 'date-time' },
      driverName: { type: 'string', example: 'Rajesh Kumar' },
      vehicleNo: { type: 'string', example: 'GJ01AB1234' },
      supplier: { type: 'string', example: 'Steel Corp India' },
      material: { type: 'string', example: 'Iron Ore' },
      gateNoteNo: { type: 'string', example: 'GN-2026-001' },
      tareWeight: { type: 'string', example: '8500' },
      grossWeight: { type: 'string', example: '25000' },
      weighBridgeStatus: { type: 'string', example: 'PENDING' },
      operatorId: {
        type: 'string',
        format: 'uuid',
        example: '91e4f3c9-2a20-4de4-9e00-8ccf2f2f1998',
      },
      projectId: {
        type: 'string',
        format: 'uuid',
        example: '88888888-8888-8888-8888-888888888801',
      },
      remarks: { type: 'string', example: 'First weighbridge entry' },
      status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
    },
  },

  WeighBridgeUpdateBody: {
    type: 'object',
    description:
      'All fields optional. Sending operatorId re-fetches and updates operatorName.',
    properties: {
      ticketNumber: { type: 'string' },
      date: { type: 'string', format: 'date-time' },
      driverName: { type: 'string' },
      vehicleNo: { type: 'string' },
      supplier: { type: 'string' },
      material: { type: 'string' },
      gateNoteNo: { type: 'string' },
      tareWeight: { type: 'string' },
      grossWeight: { type: 'string', example: '26500' },
      weighBridgeStatus: { type: 'string', example: 'COMPLETED' },
      operatorId: { type: 'string', format: 'uuid' },
      projectId: { type: 'string', format: 'uuid' },
      remarks: { type: 'string', example: 'Updated after recheck' },
      status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
    },
  },

  WeighBridgeSingleResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: {
        type: 'string',
        example: 'Weigh bridge record retrieved successfully',
      },
      data: { $ref: '#/components/schemas/WeighBridgeObject' },
    },
  },

  WeighBridgeListResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: {
        type: 'string',
        example: 'Weigh bridge records retrieved successfully',
      },
      pagination: {
        type: 'object',
        properties: {
          currentCount: { type: 'integer', example: 1 },
          totalCount: { type: 'integer', example: 1 },
          offset: { type: 'integer', example: 0 },
          limit: { type: 'integer', example: 10 },
        },
      },
      data: {
        type: 'array',
        items: { $ref: '#/components/schemas/WeighBridgeObject' },
      },
    },
  },

  WeighBridgeDeleteResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: {
        type: 'string',
        example: 'Weigh bridge record deleted successfully',
      },
      data: { type: 'object', nullable: true, example: null },
    },
  },
};
