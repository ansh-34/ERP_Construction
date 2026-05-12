export const ProjectUserRoleSchemas = {
  AssignProjectUserRoleBody: {
    type: 'object',
    required: ['projectId', 'userId', 'roleId'],
    properties: {
      projectId: {
        type: 'string',
        format: 'uuid',
        example: 'b2c3d4e5-f6a7-8901-bcde-f12345678902',
      },
      userId: {
        type: 'string',
        format: 'uuid',
        example: 'e1f2a3b4-c5d6-7890-ef01-234567890abc',
      },
      roleId: {
        type: 'string',
        format: 'uuid',
        example: 'c9a2f1e0-3b4d-4f5a-8e6c-1a2b3c4d5e6f',
      },
    },
  },
  UpdateProjectUserRoleBody: {
    type: 'object',
    properties: {
      roleId: {
        type: 'string',
        format: 'uuid',
        example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      },
      status: {
        type: 'string',
        enum: ['ACTIVE', 'INACTIVE'],
        example: 'ACTIVE',
      },
    },
  },
  ProjectUserRoleObject: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid', example: 'f1e2d3c4-b5a6-9807-6543-210fedcba987' },
      projectId: { type: 'string', format: 'uuid', example: 'b2c3d4e5-f6a7-8901-bcde-f12345678902' },
      userId: { type: 'string', format: 'uuid', example: 'e1f2a3b4-c5d6-7890-ef01-234567890abc' },
      roleId: { type: 'string', format: 'uuid', example: 'c9a2f1e0-3b4d-4f5a-8e6c-1a2b3c4d5e6f' },
      domainId: { type: 'string', format: 'uuid', example: 'd1e2f3a4-b5c6-7890-1234-56789abcdef0' },
      status: { type: 'string', example: 'ACTIVE' },
      isDeleted: { type: 'boolean', example: false },
      createdAt: { type: 'string', format: 'date-time', example: '2026-05-12T10:30:00.000Z' },
      updatedAt: { type: 'string', format: 'date-time', example: '2026-05-12T10:30:00.000Z' },
      project: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'object', example: { en: 'Highway Bridge Phase 1' } },
          code: { type: 'string', example: 'HBP1' },
        },
      },
      user: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string', example: 'John Doe' },
          email: { type: 'string', example: 'john.doe@buildcorp.com' },
        },
      },
      role: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string', example: 'Site Engineer' },
          code: { type: 'string', example: 'site_engineer' },
        },
      },
    },
  },
};
