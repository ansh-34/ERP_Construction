export const SuperAdminSchemas = {
  SuperAdminLoginBody: {
    type: 'object',
    required: ['identifier', 'password'],
    properties: {
      identifier: { type: 'string', format: 'email' },
      password: { type: 'string' },
    },
  },
  SeedDomainBody: {
    type: 'object',
    required: ['domainName', 'email', 'password', 'industry'],
    properties: {
      domainName: { type: 'string' },
      email: { type: 'string', format: 'email' },
      password: { type: 'string' },
      industry: {
        type: 'array',
        minItems: 1,
        items: {
          type: 'string',
          enum: ['CONSTRUCTION', 'MANUFACTURING', 'MINING', 'PROPERTY'],
        },
      },
      phone: { type: 'string' },
      phoneCode: { type: 'string' },
      organizationType: {},
    },
  },
};
