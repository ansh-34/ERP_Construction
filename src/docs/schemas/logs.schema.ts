export const LogsSchemas = {
  LogFileItem: {
    type: 'object',
    properties: {
      key: {
        type: 'string',
        example: 'logs/log21052026.log',
        description: 'Full S3 object key',
      },
      fileName: {
        type: 'string',
        example: 'log21052026.log',
        description: 'Log file name without the prefix',
      },
      s3Uri: {
        type: 'string',
        example: 's3://infowareconstructionerp/logs/log21052026.log',
        description: 'S3 URI of the log file',
      },
      downloadUrl: {
        type: 'string',
        format: 'uri',
        example:
          'https://infowareconstructionerp.s3.ap-south-2.amazonaws.com/logs/log21052026.log?X-Amz-Algorithm=...',
        description:
          'Presigned URL to download the log file (valid for 1 hour)',
      },
    },
  },

  ListLogsResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Logs retrieved successfully' },
      data: {
        type: 'array',
        items: { $ref: '#/components/schemas/LogFileItem' },
      },
    },
  },

  AnalyticsSummary: {
    type: 'object',
    properties: {
      totalRequests: { type: 'integer', example: 1250 },
      successCount: { type: 'integer', example: 1180 },
      failureCount: { type: 'integer', example: 70 },
      avgResponseTime: { type: 'number', format: 'float', example: 142.5 },
      maxResponseTime: { type: 'number', format: 'float', example: 3200 },
      minResponseTime: { type: 'number', format: 'float', example: 8 },
      mostHitApi: {
        type: 'string',
        nullable: true,
        example: 'GET /api/user/projects',
      },
      mostHitCount: { type: 'integer', example: 320 },
      mostFailedApi: {
        type: 'string',
        nullable: true,
        example: 'POST /api/domain/auth/login',
      },
      mostFailedCount: { type: 'integer', example: 25 },
    },
  },

  AnalyticsResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: {
        type: 'string',
        example: 'Analytics retrieved successfully',
      },
      data: {
        type: 'object',
        properties: {
          period: {
            type: 'string',
            enum: ['day', 'week', 'month'],
            example: 'week',
          },
          dateRange: {
            type: 'object',
            properties: {
              from: {
                type: 'string',
                format: 'date',
                example: '2026-05-19',
              },
              to: {
                type: 'string',
                format: 'date',
                example: '2026-05-25',
              },
            },
          },
          summary: { $ref: '#/components/schemas/AnalyticsSummary' },
        },
      },
    },
  },
};
