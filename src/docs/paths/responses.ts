export const ok = {
  200: {
    description: 'Success',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/SuccessResponse' },
      },
    },
  },
};

export const created = {
  201: {
    description: 'Created',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/SuccessResponse' },
      },
    },
  },
};

export const errors = {
  400: {
    description: 'Bad Request',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/ErrorResponse' },
      },
    },
  },
  401: {
    description: 'Unauthorized',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/ErrorResponse' },
      },
    },
  },
  403: {
    description: 'Forbidden',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/ErrorResponse' },
      },
    },
  },
  404: {
    description: 'Not Found',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/ErrorResponse' },
      },
    },
  },
  500: {
    description: 'Server Error',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/ErrorResponse' },
      },
    },
  },
};
