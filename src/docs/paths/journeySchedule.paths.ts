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
      description:
        'Returns paginated list with nested truck and loadedQuantityUom relations.',
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
      description:
        'Creates a journey schedule. Code is auto-generated in VJS-DDMMYYYYHHMMSS format. All fields except description are mandatory.',
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
                  message: {
                    type: 'string',
                    example: 'Journey schedule created',
                  },
                  data: {
                    $ref: '#/components/schemas/JourneyScheduleObject',
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
  '/api/domain/journey-schedules/{id}': {
    delete: {
      tags: ['Journey Schedules'],
      summary: 'Delete journey schedule (soft delete)',
      description:
        'Soft deletes a journey schedule by setting isDeleted to true and status to INACTIVE.',
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
          description: 'Journey schedule deleted successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example: 'Journey schedule deleted successfully',
                  },
                  data: { type: 'object', nullable: true, example: null },
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

Object.assign(JourneySchedulePaths, {
  '/api/user/journey-schedules/stats':
    JourneySchedulePaths['/api/domain/journey-schedules/stats'],
  '/api/user/journey-schedules':
    JourneySchedulePaths['/api/domain/journey-schedules'],
  '/api/user/journey-schedules/{id}':
    JourneySchedulePaths['/api/domain/journey-schedules/{id}'],
});
