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
    required: ['name', 'email', 'password'],
    properties: {
      name: { type: 'string' },
      email: { type: 'string', format: 'email' },
      password: { type: 'string' },
      phone: { type: 'string' },
      phoneCode: { type: 'string' },
    },
  },
  VerifyUserQuery: {
    type: 'object',
    required: ['email', 'token'],
    properties: {
      email: { type: 'string', format: 'email' },
      token: { type: 'string' },
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
  ChangePasswordBody: {
    type: 'object',
    required: ['currentPassword', 'newPassword'],
    properties: {
      currentPassword: { type: 'string' },
      newPassword: {
        type: 'string',
        description:
          'Min 8 chars, uppercase, lowercase, number, and special character',
      },
    },
  },
  ForgotPasswordBody: {
    type: 'object',
    required: ['email'],
    properties: {
      email: { type: 'string', format: 'email' },
    },
  },
  ResetPasswordBody: {
    type: 'object',
    required: ['email', 'otp', 'newPassword'],
    properties: {
      email: { type: 'string', format: 'email' },
      otp: { type: 'string', minLength: 6, maxLength: 6 },
      newPassword: {
        type: 'string',
        description:
          'Min 8 chars, uppercase, lowercase, number, and special character',
      },
    },
  },
  DomainLoginResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Login successful' },
      data: {
        type: 'object',
        properties: {
          accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
          refreshToken: { type: 'string', example: '85a01324767ed824...' },
          user: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'object', example: { en: 'Domain Owner' } },
              email: { type: 'string', format: 'email', example: 'owner@domain.com' },
              role: { type: 'string', example: 'domain' },
            },
          },
          domain: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'object', example: { en: 'My Company' } },
              industry: {
                type: 'string',
                enum: ['CONSTRUCTION', 'MANUFACTURING', 'MINING', 'PROPERTY'],
                example: 'CONSTRUCTION',
              },
            },
          },
        },
      },
    },
  },
  UserLoginResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Login successful' },
      data: {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string', example: 'John Doe' },
              email: { type: 'string', format: 'email' },
              role: { type: 'string', example: 'user' },
            },
          },
          domain: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'object', example: { en: 'My Company' } },
              industry: { type: 'string', example: 'CONSTRUCTION' },
            },
          },
        },
      },
    },
  },
};
