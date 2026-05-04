export const UserSchemas = {
  DomainLoginBody: {
    type: 'object',
    required: ['identifier', 'password', 'speciality'],
    properties: {
      identifier: { type: 'string', format: 'email' },
      password: { type: 'string' },
      speciality: {
        type: 'string',
        enum: ['CONSTRUCTION', 'MANUFACTURING', 'MINING', 'PROPERTY'],
      },
    },
  },
  UserLoginBody: {
    type: 'object',
    required: ['email', 'password', 'speciality'],
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string' },
      speciality: {
        type: 'string',
        enum: ['CONSTRUCTION', 'MANUFACTURING', 'MINING', 'PROPERTY'],
      },
    },
  },
  RegisterUserBody: {
    type: 'object',
    required: ['name', 'email', 'password', 'domainId'],
    properties: {
      name: { type: 'string' },
      email: { type: 'string', format: 'email' },
      password: { type: 'string' },
      phone: { type: 'string' },
      phoneCode: { type: 'string' },
      domainId: { type: 'string' },
    },
  },
  VerifyUserBody: {
    type: 'object',
    required: ['email', 'token', 'password'],
    properties: {
      email: { type: 'string', format: 'email' },
      token: { type: 'string' },
      password: { type: 'string' },
    },
  },
  InviteUserBody: {
    type: 'object',
    required: ['email'],
    properties: {
      name: { type: 'string' },
      email: { type: 'string', format: 'email' },
      roleId: { type: 'string' },
    },
  },
};
