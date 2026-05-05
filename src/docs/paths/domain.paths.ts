import { errors } from './responses.js';

export const DomainPaths = {
  '/api/domain/auth/login': {
    post: {
      tags: ['Domain Auth'],
      summary: 'Login domain owner',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/DomainLoginBody' },
          },
        },
      },
      responses: {
        200: {
          description: 'Login successful',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/DomainLoginResponse' },
            },
          },
        },
        ...errors,
      },
    },
  },

  '/api/domain/auth/refresh-token': {
    post: {
      tags: ['Domain Auth'],
      summary: 'Refresh domain access token',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['refreshToken'],
              properties: {
                refreshToken: { type: 'string' },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Token refreshed',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/DomainLoginResponse' },
            },
          },
        },
        ...errors,
      },
    },
  },

  '/api/domain/auth/logout': {
    post: {
      tags: ['Domain Auth'],
      summary: 'Logout domain user',
      requestBody: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                refreshToken: { type: 'string' },
              },
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

  '/api/domain/auth/change-password': {
    post: {
      tags: ['Domain Auth'],
      summary: 'Change domain password (requires auth)',
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
          description: 'Password changed',
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

  '/api/domain/auth/forgot-password': {
    post: {
      tags: ['Domain Auth'],
      summary: 'Request domain password reset OTP',
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

  '/api/domain/auth/reset-password': {
    post: {
      tags: ['Domain Auth'],
      summary: 'Reset domain password with OTP',
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
};
