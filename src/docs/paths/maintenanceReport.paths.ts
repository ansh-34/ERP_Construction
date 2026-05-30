import { errors } from './responses.js';

export const MaintenanceReportPaths = {
  '/api/domain/maintenance-reports': {
    get: {
      tags: ['Domain Maintenance Reports'],
      summary: 'Get maintenance expense analytics',
      description:
        'Calculates maintenance analytics from maintenance logs. No separate report table is used.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'query',
          name: 'domainId',
          required: true,
          schema: { type: 'string', format: 'uuid' },
        },
        {
          in: 'query',
          name: 'groupBy',
          schema: {
            type: 'string',
            enum: ['WEEK', 'MONTH', 'YEAR'],
            default: 'MONTH',
          },
        },
        {
          in: 'query',
          name: 'assetType',
          schema: { type: 'string', enum: ['VEHICLE', 'MACHINERY'] },
        },
        {
          in: 'query',
          name: 'vehicleId',
          schema: { type: 'string', format: 'uuid' },
        },
        {
          in: 'query',
          name: 'machineryId',
          schema: { type: 'string', format: 'uuid' },
        },
        { in: 'query', name: 'fromDate', schema: { type: 'string' } },
        { in: 'query', name: 'toDate', schema: { type: 'string' } },
      ],
      responses: {
        200: {
          description: 'Maintenance report fetched successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'Maintenance report fetched successfully',
                  },
                  data: {
                    $ref: '#/components/schemas/MaintenanceReportObject',
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
