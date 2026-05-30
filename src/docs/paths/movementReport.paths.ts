import { errors } from './responses.js';

export const MovementReportPaths = {
  '/api/domain/movement-reports': {
    get: {
      tags: ['Domain Movement Reports'],
      summary: 'Get movement analytics',
      description:
        'Calculates movement analytics from movement logs. No separate report table is used.',
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
          name: 'assetType',
          schema: { type: 'string', enum: ['VEHICLE', 'MACHINERY'] },
        },
        {
          in: 'query',
          name: 'movementType',
          schema: {
            type: 'string',
            enum: [
              'WAREHOUSE',
              'WAREHOUSE_TO_SITE',
              'SITE_TO_WAREHOUSE',
              'PROJECT_SITE',
              'SITE_TO_SITE',
              'OTHER',
            ],
          },
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
        {
          in: 'query',
          name: 'projectId',
          schema: { type: 'string', format: 'uuid' },
        },
        { in: 'query', name: 'fromDate', schema: { type: 'string' } },
        { in: 'query', name: 'toDate', schema: { type: 'string' } },
      ],
      responses: {
        200: {
          description: 'Movement report fetched successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'Movement report fetched successfully',
                  },
                  data: {
                    $ref: '#/components/schemas/MovementReportObject',
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
