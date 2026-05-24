export const VehicleSchemas = {
  CreateVehicleBody: {
    type: 'object',
    required: [
      'numberPlate',
      'vehicleType',
      'loadCapacity',
      'loadCapacityUomId',
      'alertLoadThreshold',
    ],
    properties: {
      numberPlate: { type: 'string', example: 'MH-12-AB-1234' },
      vehicleType: { type: 'string', example: 'TRUCK' },
      loadCapacity: { type: 'number', example: 15000 },
      loadCapacityUomId: {
        type: 'string',
        format: 'uuid',
        example: '0e026814-95d6-4100-8afd-5b8f2dda6d5f',
      },
      alertLoadThreshold: { type: 'number', example: 12000 },
    },
  },

  VehicleObject: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        example: '1e9245eb-dd25-4c36-9f32-a119ef313524',
      },
      numberPlate: { type: 'string', example: 'MH-12-AB-1234' },
      vehicleType: { type: 'string', example: 'TRUCK' },
      loadCapacity: { type: 'number', example: 15000 },
      loadCapacityUomId: {
        type: 'string',
        format: 'uuid',
        example: '0e026814-95d6-4100-8afd-5b8f2dda6d5f',
      },
      alertLoadThreshold: { type: 'number', example: 12000 },
      domainId: {
        type: 'string',
        format: 'uuid',
        example: 'd7ef8519-601e-4675-add6-27f762cb0aa4',
      },
      status: { type: 'string', example: 'ACTIVE' },
      isDeleted: { type: 'boolean', example: false },
      createdAt: {
        type: 'string',
        format: 'date-time',
        example: '2026-05-24T22:44:39.989Z',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        example: '2026-05-24T22:44:39.989Z',
      },
    },
  },

  VehicleDetailResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Vehicles retrieved' },
      data: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          numberPlate: { type: 'string', example: 'MH-12-AB-1234' },
          vehicleType: { type: 'string', example: 'TRUCK' },
          loadCapacity: { type: 'number', example: 15000 },
          loadCapacityUomId: { type: 'string', format: 'uuid' },
          alertLoadThreshold: { type: 'number', example: 12000 },
          domainId: { type: 'string', format: 'uuid' },
          status: { type: 'string', example: 'ACTIVE' },
          isDeleted: { type: 'boolean', example: false },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          loadCapacityUom: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              displayName: {
                type: 'object',
                example: { en: 'Kilogram' },
              },
              code: { type: 'string', example: 'KG' },
              conversionRate: { type: 'number', example: 1 },
            },
          },
          journeySchedules: {
            type: 'array',
            items: { $ref: '#/components/schemas/JourneyScheduleObject' },
          },
          dispatches: {
            type: 'array',
            items: { $ref: '#/components/schemas/DispatchObject' },
          },
        },
      },
    },
  },

  VehicleListResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Vehicles retrieved' },
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
        items: {
          allOf: [
            { $ref: '#/components/schemas/VehicleObject' },
            {
              type: 'object',
              properties: {
                loadCapacityUom: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', format: 'uuid' },
                    displayName: {
                      type: 'object',
                      example: { en: 'Kilogram' },
                    },
                    code: { type: 'string', example: 'KG' },
                  },
                },
                latestSchedule: {
                  type: 'object',
                  nullable: true,
                  properties: {
                    id: { type: 'string', format: 'uuid' },
                    code: {
                      type: 'string',
                      example: 'VJS-25052026041431',
                    },
                    loadingStatus: { type: 'string', example: 'LOADED' },
                    date: { type: 'string', format: 'date-time' },
                  },
                },
                latestDispatch: {
                  type: 'object',
                  nullable: true,
                  properties: {
                    id: { type: 'string', format: 'uuid' },
                    code: {
                      type: 'string',
                      example: 'DV-25052026041431',
                    },
                    journeyStatus: {
                      type: 'string',
                      example: 'SCHEDULED',
                    },
                    date: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          ],
        },
      },
    },
  },

  VehicleStatsResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Vehicle stats retrieved' },
      data: {
        type: 'object',
        properties: {
          totalVehicles: { type: 'integer', example: 10 },
          activeVehicles: { type: 'integer', example: 8 },
          inactiveVehicles: { type: 'integer', example: 2 },
          totalLoadCapacity: { type: 'number', example: 50000 },
          vehicleTypeBreakdown: {
            type: 'object',
            additionalProperties: { type: 'integer' },
            example: { TRUCK: 5, VAN: 3, TRAILER: 2 },
          },
        },
      },
    },
  },
};
