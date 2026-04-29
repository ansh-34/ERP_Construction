export const SuperadminSchemas = {
  SuperadminLoginBody: {
    type: 'object',
    required: ['superadminEmail', 'superadminPassword'],
    properties: {
      superadminEmail: { type: 'string', format: 'email' },
      superadminPassword: { type: 'string' },
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
