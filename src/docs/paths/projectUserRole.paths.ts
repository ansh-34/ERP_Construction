import { errors } from './responses.js';

const paginationParams = [
  {
    in: 'query' as const,
    name: 'offset',
    schema: { type: 'integer', minimum: 0, default: 0 },
    description: 'Number of records to skip',
  },
  {
    in: 'query' as const,
    name: 'limit',
    schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
    description: 'Maximum number of records to return',
  },
];

const assignmentListResponse = {
  description: 'Project user roles retrieved',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Project user roles retrieved' },
          pagination: {
            type: 'object',
            properties: {
              currentCount: { type: 'integer', example: 1 },
              totalCount: { type: 'integer', example: 3 },
              offset: { type: 'integer', example: 0 },
              limit: { type: 'integer', example: 10 },
            },
          },
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/ProjectUserRoleObject' },
          },
        },
      },
      example: {
        success: true,
        message: 'Project user roles retrieved',
        pagination: { currentCount: 1, totalCount: 3, offset: 0, limit: 10 },
        data: [
          {
            id: 'f1e2d3c4-b5a6-9807-6543-210fedcba987',
            projectId: 'b2c3d4e5-f6a7-8901-bcde-f12345678902',
            userId: 'e1f2a3b4-c5d6-7890-ef01-234567890abc',
            roleId: 'c9a2f1e0-3b4d-4f5a-8e6c-1a2b3c4d5e6f',
            domainId: 'd1e2f3a4-b5c6-7890-1234-56789abcdef0',
            status: 'ACTIVE',
            isDeleted: false,
            createdAt: '2026-05-12T10:30:00.000Z',
            updatedAt: '2026-05-12T10:30:00.000Z',
            project: {
              id: 'b2c3d4e5-f6a7-8901-bcde-f12345678902',
              name: { en: 'Highway Bridge Phase 1' },
              code: 'HBP1',
            },
            user: {
              id: 'e1f2a3b4-c5d6-7890-ef01-234567890abc',
              name: 'John Doe',
              email: 'john.doe@buildcorp.com',
            },
            role: {
              id: 'c9a2f1e0-3b4d-4f5a-8e6c-1a2b3c4d5e6f',
              name: 'Site Engineer',
              code: 'site_engineer',
            },
          },
        ],
      },
    },
  },
};

export const ProjectUserRolePaths = {
  '/api/domain/project-user-roles': {
    post: {
      tags: ['Project User Roles'],
      summary: 'Assign user to project with role',
      description:
        'Create a project-level role assignment. Links a user to a project with a specific role. The projectId, userId, and roleId must all belong to the same domain.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/AssignProjectUserRoleBody' },
            example: {
              projectId: 'b2c3d4e5-f6a7-8901-bcde-f12345678902',
              userId: 'e1f2a3b4-c5d6-7890-ef01-234567890abc',
              roleId: 'c9a2f1e0-3b4d-4f5a-8e6c-1a2b3c4d5e6f',
            },
          },
        },
      },
      responses: {
        201: {
          description: 'User assigned to project successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example: 'User assigned to project successfully',
                  },
                  data: { $ref: '#/components/schemas/ProjectUserRoleObject' },
                },
              },
              example: {
                success: true,
                message: 'User assigned to project successfully',
                data: {
                  id: 'f1e2d3c4-b5a6-9807-6543-210fedcba987',
                  projectId: 'b2c3d4e5-f6a7-8901-bcde-f12345678902',
                  userId: 'e1f2a3b4-c5d6-7890-ef01-234567890abc',
                  roleId: 'c9a2f1e0-3b4d-4f5a-8e6c-1a2b3c4d5e6f',
                  domainId: 'd1e2f3a4-b5c6-7890-1234-56789abcdef0',
                  status: 'ACTIVE',
                  isDeleted: false,
                  createdAt: '2026-05-12T10:30:00.000Z',
                  updatedAt: '2026-05-12T10:30:00.000Z',
                },
              },
            },
          },
        },
        ...errors,
      },
    },
    get: {
      tags: ['Project User Roles'],
      summary: 'List all project user role assignments',
      description:
        'Retrieve a paginated list of all project-user-role assignments in the domain. Supports filtering by projectId, userId, roleId, and status.',
      security: [{ bearerAuth: [] }],
      parameters: [
        ...paginationParams,
        {
          in: 'query',
          name: 'projectId',
          schema: { type: 'string', format: 'uuid' },
          description: 'Filter by project',
        },
        {
          in: 'query',
          name: 'userId',
          schema: { type: 'string', format: 'uuid' },
          description: 'Filter by user',
        },
        {
          in: 'query',
          name: 'roleId',
          schema: { type: 'string', format: 'uuid' },
          description: 'Filter by role',
        },
        {
          in: 'query',
          name: 'status',
          schema: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
          description: 'Filter by status',
        },
      ],
      responses: {
        200: assignmentListResponse,
        ...errors,
      },
    },
  },

  '/api/domain/project-user-roles/project/{projectId}': {
    get: {
      tags: ['Project User Roles'],
      summary: 'List assignments by project',
      description: 'Retrieve all user-role assignments for a specific project.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'projectId',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description: 'Project ID',
        },
        ...paginationParams,
      ],
      responses: {
        200: assignmentListResponse,
        ...errors,
      },
    },
  },

  '/api/domain/project-user-roles/user/{userId}': {
    get: {
      tags: ['Project User Roles'],
      summary: 'List assignments by user',
      description: 'Retrieve all project-role assignments for a specific user.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'userId',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description: 'User ID',
        },
        ...paginationParams,
      ],
      responses: {
        200: assignmentListResponse,
        ...errors,
      },
    },
  },

  '/api/domain/project-user-roles/{id}': {
    get: {
      tags: ['Project User Roles'],
      summary: 'Get assignment by ID',
      description: 'Retrieve a single project-user-role assignment by its ID.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description: 'Assignment ID',
        },
      ],
      responses: {
        200: {
          description: 'Project user role retrieved',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example: 'Project user roles retrieved',
                  },
                  data: { $ref: '#/components/schemas/ProjectUserRoleObject' },
                },
              },
              example: {
                success: true,
                message: 'Project user roles retrieved',
                data: {
                  id: 'f1e2d3c4-b5a6-9807-6543-210fedcba987',
                  projectId: 'b2c3d4e5-f6a7-8901-bcde-f12345678902',
                  userId: 'e1f2a3b4-c5d6-7890-ef01-234567890abc',
                  roleId: 'c9a2f1e0-3b4d-4f5a-8e6c-1a2b3c4d5e6f',
                  domainId: 'd1e2f3a4-b5c6-7890-1234-56789abcdef0',
                  status: 'ACTIVE',
                  isDeleted: false,
                  createdAt: '2026-05-12T10:30:00.000Z',
                  updatedAt: '2026-05-12T10:30:00.000Z',
                  project: {
                    id: 'b2c3d4e5-f6a7-8901-bcde-f12345678902',
                    name: { en: 'Highway Bridge Phase 1' },
                    code: 'HBP1',
                  },
                  user: {
                    id: 'e1f2a3b4-c5d6-7890-ef01-234567890abc',
                    name: 'John Doe',
                    email: 'john.doe@buildcorp.com',
                  },
                  role: {
                    id: 'c9a2f1e0-3b4d-4f5a-8e6c-1a2b3c4d5e6f',
                    name: 'Site Engineer',
                    code: 'site_engineer',
                  },
                },
              },
            },
          },
        },
        ...errors,
      },
    },
    put: {
      tags: ['Project User Roles'],
      summary: 'Update assignment',
      description:
        'Update a project-user-role assignment. You can change the role or status.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description: 'Assignment ID',
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UpdateProjectUserRoleBody' },
            example: {
              roleId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
              status: 'ACTIVE',
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Project user role updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example: 'Project user role updated successfully',
                  },
                  data: { $ref: '#/components/schemas/ProjectUserRoleObject' },
                },
              },
              example: {
                success: true,
                message: 'Project user role updated successfully',
                data: {
                  id: 'f1e2d3c4-b5a6-9807-6543-210fedcba987',
                  projectId: 'b2c3d4e5-f6a7-8901-bcde-f12345678902',
                  userId: 'e1f2a3b4-c5d6-7890-ef01-234567890abc',
                  roleId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                  domainId: 'd1e2f3a4-b5c6-7890-1234-56789abcdef0',
                  status: 'ACTIVE',
                  isDeleted: false,
                  createdAt: '2026-05-12T10:30:00.000Z',
                  updatedAt: '2026-05-12T11:00:00.000Z',
                },
              },
            },
          },
        },
        ...errors,
      },
    },
    delete: {
      tags: ['Project User Roles'],
      summary: 'Remove user from project',
      description:
        'Soft-delete a project-user-role assignment (sets isDeleted=true, status=INACTIVE).',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description: 'Assignment ID',
        },
      ],
      responses: {
        200: {
          description: 'User removed from project successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example: 'User removed from project successfully',
                  },
                  data: { $ref: '#/components/schemas/ProjectUserRoleObject' },
                },
              },
              example: {
                success: true,
                message: 'User removed from project successfully',
                data: {
                  id: 'f1e2d3c4-b5a6-9807-6543-210fedcba987',
                  projectId: 'b2c3d4e5-f6a7-8901-bcde-f12345678902',
                  userId: 'e1f2a3b4-c5d6-7890-ef01-234567890abc',
                  roleId: 'c9a2f1e0-3b4d-4f5a-8e6c-1a2b3c4d5e6f',
                  domainId: 'd1e2f3a4-b5c6-7890-1234-56789abcdef0',
                  status: 'INACTIVE',
                  isDeleted: true,
                  createdAt: '2026-05-12T10:30:00.000Z',
                  updatedAt: '2026-05-12T12:00:00.000Z',
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
