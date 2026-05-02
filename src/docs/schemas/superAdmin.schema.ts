export const SuperAdminSchemas = {
  SuperAdminLoginBody: {
    type: 'object',
    required: ['superAdminEmail', 'superAdminPassword'],
    properties: {
      superAdminEmail: { type: 'string', format: 'email' },
      superAdminPassword: { type: 'string' },
    },
  },
  SeedDomainBody: {
    type: 'object',
    required: ['domainName', 'email', 'password'],
    properties: {
      domainName: { type: 'string' },
      email: { type: 'string', format: 'email' },
      password: { type: 'string' },
      phone: { type: 'string' },
      phoneCode: { type: 'string' },
      organizationType: {},
    },
  },
};
