import { errors } from './responses.js';

export const VehiclePaths = {
  '/api/domain/vehicles/stats': {
    get: {
      tags: ['Vehicles'],
      summary: 'Vehicle stats',
      description:
        'Returns total/active/inactive vehicle counts, total load capacity, and breakdown by vehicle type.',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Vehicle stats retrieved',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/VehicleStatsResponse' },
            },
          },
        },
        ...errors,
      },
    },
  },
  '/api/domain/vehicles': {
    get: {
      tags: ['Vehicles'],
      summary: 'List vehicles',
      description:
        'Returns paginated list. Each vehicle includes latestSchedule and latestDispatch from related modules.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'query',
          name: 'offset',
          schema: { type: 'integer', minimum: 0, default: 0 },
        },
        {
          in: 'query',
          name: 'limit',
          schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
        },
      ],
      responses: {
        200: {
          description: 'Vehicles retrieved',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/VehicleListResponse' },
            },
          },
        },
        ...errors,
      },
    },
    post: {
      tags: ['Vehicles'],
      summary: 'Create vehicle',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateVehicleBody' },
          },
        },
      },
      responses: {
        201: {
          description: 'Vehicle created',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Vehicle created' },
                  data: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', format: 'uuid' },
                      numberPlate: { type: 'string', example: 'MH-12-AB-1234' },
                      vehicleType: { type: 'string', example: 'TRUCK' },
                      loadCapacity: { type: 'number', example: 5000 },
                      status: { type: 'string', example: 'active' },
                      createdAt: { type: 'string', format: 'date-time' },
                    },
                  },
                },
              },
            },
          },
        },
        ...errors,
      },
    },
  },
  '/api/domain/vehicles/{id}': {
    get: {
      tags: ['Vehicles'],
      summary: 'Get vehicle by ID',
      description:
        'Returns full vehicle detail with all journey schedules and all dispatches history.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string', format: 'uuid' },
        },
      ],
      responses: {
        200: {
          description: 'Vehicle detail retrieved',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/VehicleDetailResponse' },
            },
          },
        },
        ...errors,
      },
    },
  },
};
