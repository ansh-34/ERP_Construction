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
      domainName: {
        type: 'object',
        properties: {
          en: { type: 'string', example: 'Construction Corp Inc' },
        },
        required: ['en'],
      },
      email: {
        type: 'string',
        format: 'email',
        example: 'owner@constructioncorp.com',
      },
      password: { type: 'string', example: 'Password123!' },
      industry: {
        type: 'string',
        enum: ['CONSTRUCTION', 'MANUFACTURING', 'MINING', 'PROPERTY'],
        example: 'CONSTRUCTION',
      },
      phone: { type: 'string', example: '9998887777' },
      phoneCode: { type: 'string', example: '+1' },
      organizationType: { type: 'string', example: 'LLC' },
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
      message: {
        type: 'string',
        example: 'Domain seeded successfully. Verification link sent to email.',
      },
      data: {
        type: 'object',
        properties: {
          domain: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string', example: 'Construction Corp Inc' },
              email: { type: 'string', format: 'email' },
              industry: { type: 'string', example: 'CONSTRUCTION' },
            },
          },
          link: {
            type: 'string',
            example:
              'https://construction-infoware.vercel.app/verify/token?token=40c9028b556ce6d893583e056b782ed1dce9d04daf66eba3e702f19108aaf6bb&context=domain-onboarding&email=owner%40constructioncorp.com&speciality=CONSTRUCTION',
          },
        },
      },
    },
  },
};
