import { errors } from './responses.js';

export const UserPaths = {
  '/api/user/auth/verify': {
    get: {
      tags: ['User Auth'],
      summary: 'Verify and activate invited user',
      parameters: [
        {
          in: 'query',
          name: 'email',
          required: true,
          schema: { type: 'string', format: 'email' },
        },
        {
          in: 'query',
          name: 'token',
          required: true,
          schema: { type: 'string' },
        },
      ],
      responses: {
        200: {
          description: 'Account verified and activated',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example: 'Account verified successfully',
                  },
                  data: {
                    type: 'object',
                    properties: {
                      email: { type: 'string', format: 'email' },
                      dummyPassword: {
                        type: 'string',
                        description: 'Generated temporary password',
                      },
                      industry: { type: 'string', example: 'CONSTRUCTION' },
                      domainId: { type: 'string', format: 'uuid' },
                    },
                  },
                },
              },
            },
          },
        },
        ...errors,
      },
    },
  },

  '/api/user/auth/register': {
    post: {
      tags: ['User Auth'],
      summary: 'Register user (requires domain auth token)',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/RegisterUserBody' },
          },
        },
      },
      responses: {
        201: {
          description: 'User registered',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UserLoginResponse' },
            },
          },
        },
        ...errors,
      },
    },
  },

  '/api/user/auth/login': {
    post: {
      tags: ['User Auth'],
      summary: 'User login',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UserLoginBody' },
          },
        },
      },
      responses: {
        200: {
          description: 'Login successful',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UserLoginResponse' },
            },
          },
        },
        ...errors,
      },
    },
  },

  '/api/user/auth/refresh-token': {
    post: {
      tags: ['User Auth'],
      summary: 'Refresh access token',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['refreshToken'],
              properties: { refreshToken: { type: 'string' } },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Token refreshed',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Token refreshed' },
                  data: {
                    type: 'object',
                    properties: {
                      accessToken: { type: 'string' },
                      refreshToken: { type: 'string' },
                      user: {
                        type: 'object',
                        properties: {
                          id: { type: 'string', format: 'uuid' },
                          name: { type: 'string' },
                          email: { type: 'string', format: 'email' },
                          industry: { type: 'string' },
                          role: { type: 'string', nullable: true },
                        },
                      },
                      domain: {
                        type: 'object',
                        properties: {
                          id: { type: 'string', format: 'uuid' },
                          name: { type: 'object' },
                          industry: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        ...errors,
      },
    },
  },

  '/api/user/auth/logout': {
    post: {
      tags: ['User Auth'],
      summary: 'Logout user',
      requestBody: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: { refreshToken: { type: 'string' } },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Logged out',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example: 'Logged out successfully',
                  },
                },
              },
            },
          },
        },
        ...errors,
      },
    },
  },

  '/api/user/auth/change-password': {
    post: {
      tags: ['User Auth'],
      summary: 'Change password (requires auth)',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ChangePasswordBody' },
          },
        },
      },
      responses: {
        200: {
          description: 'Password changed, sessions cleared',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example: 'Password changed successfully',
                  },
                },
              },
            },
          },
        },
        ...errors,
      },
    },
  },

  '/api/user/auth/forgot-password': {
    post: {
      tags: ['User Auth'],
      summary: 'Request password reset OTP',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ForgotPasswordBody' },
          },
        },
      },
      responses: {
        200: {
          description: 'OTP sent if email exists',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example: 'If the email exists, an OTP has been sent',
                  },
                },
              },
            },
          },
        },
        ...errors,
      },
    },
  },

  '/api/user/auth/reset-password': {
    post: {
      tags: ['User Auth'],
      summary: 'Reset password with OTP',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ResetPasswordBody' },
          },
        },
      },
      responses: {
        200: {
          description: 'Password reset successful',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example: 'Password has been reset successfully',
                  },
                },
              },
            },
          },
        },
        ...errors,
      },
    },
  },

  '/api/domain/users/invite': {
    post: {
      tags: ['Domain Users'],
      summary: 'Invite user to domain',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/InviteUserBody' },
          },
        },
      },
      responses: {
        200: {
          description: 'Invitation sent',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example: 'User invited successfully',
                  },
                },
              },
            },
          },
        },
        ...errors,
      },
    },
  },

  '/api/domain/users': {
    get: {
      tags: ['Domain Users'],
      summary: 'List domain users',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'query',
          name: 'offset',
          schema: { type: 'integer', minimum: 0 },
        },
        {
          in: 'query',
          name: 'limit',
          schema: { type: 'integer', minimum: 1, maximum: 100 },
        },
      ],
      responses: {
        200: {
          description: 'Domain users retrieved',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Users retrieved' },
                  pagination: {
                    type: 'object',
                    properties: {
                      currentCount: { type: 'integer' },
                      totalCount: { type: 'integer' },
                      offset: { type: 'integer' },
                      limit: { type: 'integer' },
                    },
                  },
                  data: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', format: 'uuid' },
                        name: { type: 'string' },
                        email: { type: 'string', format: 'email' },
                        phone: { type: 'string', nullable: true },
                        status: { type: 'string', example: 'active' },
                        isEmailVerified: { type: 'boolean' },
                        createdAt: { type: 'string', format: 'date-time' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        ...errors,
      },
    },
  },
};
