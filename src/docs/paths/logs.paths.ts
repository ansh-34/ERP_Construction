import { errors } from './responses.js';

export const LogsPaths = {
  '/api/superAdmin/log': {
    get: {
      tags: ['Logs'],
      summary: 'List all uploaded log files',
      description:
        'Returns every log file stored in S3 together with a presigned download URL valid for 1 hour. SuperAdmin access required.',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Log files retrieved successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ListLogsResponse' },
            },
          },
        },
        ...errors,
      },
    },
  },

  '/api/superAdmin/log/analytics': {
    get: {
      tags: ['Logs'],
      summary: 'Get request analytics',
      description:
        'Returns aggregated API request analytics for a given period (day / week / month). SuperAdmin access required.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'query',
          name: 'period',
          required: true,
          schema: { type: 'string', enum: ['day', 'week', 'month'] },
          description: 'Aggregation period',
        },
        {
          in: 'query',
          name: 'date',
          required: false,
          schema: { type: 'string', format: 'date', example: '2026-05-21' },
          description:
            'Anchor date in YYYY-MM-DD format (defaults to today if omitted)',
        },
      ],
      responses: {
        200: {
          description: 'Analytics retrieved successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AnalyticsResponse' },
            },
          },
        },
        ...errors,
      },
    },
  },
};
