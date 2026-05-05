import { errors } from './responses.js';

export const JourneySchedulePaths = {
  '/api/domain/journey-schedules/stats': {
    get: {
      tags: ['Journey Schedules'],
      summary: 'Truck load monitor stats',
      description:
        'Returns total schedules, loading status breakdown (pending/loaded/inTransit), load quantity, distance, and fuel aggregates.',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Journey schedule stats retrieved',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/JourneyScheduleStatsResponse',
              },
            },
          },
        },
        ...errors,
      },
    },
  },
  '/api/domain/journey-schedules': {
    get: {
      tags: ['Journey Schedules'],
      summary: 'List journey schedules',
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
          description: 'Journey schedules retrieved',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/JourneyScheduleListResponse',
              },
            },
          },
        },
        ...errors,
      },
    },
    post: {
      tags: ['Journey Schedules'],
      summary: 'Create journey schedule',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateJourneyScheduleBody' },
          },
        },
      },
      responses: {
        201: {
          description: 'Journey schedule created',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Journey schedule created' },
                  data: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', format: 'uuid' },
                      code: { type: 'string', example: 'JS-001' },
                      truckId: { type: 'string', format: 'uuid' },
                      loadingStatus: { type: 'string', example: 'PENDING' },
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
};
