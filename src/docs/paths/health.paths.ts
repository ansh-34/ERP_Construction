export const HealthPaths = {
  '/health': {
    get: {
      tags: ['Health'],
      summary: 'Health check',
      responses: {
        200: {
          description: 'Server is running',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/HealthResponse' },
            },
          },
        },
      },
    },
  },
};
