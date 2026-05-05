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
        type: 'string',
        enum: ['CONSTRUCTION', 'MANUFACTURING', 'MINING', 'PROPERTY'],
      },
      phone: { type: 'string' },
      phoneCode: { type: 'string' },
      organizationType: {},
    },
  },
  SuperAdminLoginResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Superadmin verified' },
      accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
      refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
    },
  },
  SeedDomainResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Domain seeded successfully. Verification link sent to email.' },
      data: {
        type: 'object',
        properties: {
          domain: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'object', example: { en: 'My Company' } },
              email: { type: 'string', format: 'email' },
              industry: { type: 'string', example: 'CONSTRUCTION' },
            },
          },
        },
      },
    },
  },
};
