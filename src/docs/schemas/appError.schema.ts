export const AppErrorSchemas = {
  CreateAppErrorBody: {
    type: 'object',
    required: ['deviceName', 'version', 'error', 'functionName'],
    properties: {
      deviceName: { type: 'string' },
      version: { type: 'string' },
      error: { type: 'string' },
      functionName: { type: 'string' },
    },
  },
};
