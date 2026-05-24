import { errors } from './responses.js';

export const DispatchPaths = {
  '/api/domain/dispatch/stats': {
    get: {
      tags: ['Dispatch'],
      summary: 'Dispatch tracking stats',
      description:
        'Returns total dispatches, journey status breakdown (scheduled/inTransit/delivered/cancelled), loading status breakdown, distance, load, and fuel summaries.',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Dispatch stats retrieved',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/DispatchStatsResponse' },
            },
          },
        },
        ...errors,
      },
    },
  },
  '/api/domain/dispatch': {
    get: {
      tags: ['Dispatch'],
      summary: 'List dispatch entries',
      description:
        'Returns paginated list with nested vehicle, journeySchedule, and loadedQuantityUom relations.',
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
          description: 'Dispatches retrieved',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/DispatchListResponse' },
            },
          },
        },
        ...errors,
      },
    },
    post: {
      tags: ['Dispatch'],
      summary: 'Create dispatch',
      description:
        'Creates a dispatch entry. Code is auto-generated in DV-DDMMYYYYHHMMSS format. All shared fields (date, driverName, startLocation, etc.) are inherited from the parent Journey Schedule.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateDispatchBody' },
          },
        },
      },
      responses: {
        201: {
          description: 'Dispatch created',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example: 'Dispatch entry created',
                  },
                  data: { $ref: '#/components/schemas/DispatchObject' },
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
