import { ok, created, errors } from './responses.js';

export const JourneySchedulePaths = {
  '/api/journey-schedules/entry': {
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
      responses: { ...created, ...errors },
    },
  },

  '/api/journey-schedules/list': {
    get: {
      tags: ['Journey Schedules'],
      summary: 'List journey schedules',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'query',
          name: 'offset',
          schema: { type: 'integer', minimum: 0 },
        },
        {
          in: 'query',
          name: 'limit',
          schema: { type: 'integer', minimum: 1, maximum: 100 },
        },
      ],
      responses: { ...ok, ...errors },
    },
  },
};
