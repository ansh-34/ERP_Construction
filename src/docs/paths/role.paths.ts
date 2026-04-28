export const RolePaths = {
  '/superAdmin/role': {
    post: {
      tags: ['SuperAdmin Role Apis'],
      summary: 'Create Role',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/AddRoleRequest' },
          },
        },
      },
      responses: {
        200: {
          description: 'Role created',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RoleMutationResponse' },
            },
          },
        },
      },
    },
  },

  '/superAdmin/role/{id}': {
    put: {
      tags: ['SuperAdmin Role Apis'],
      summary: 'Edit Role',
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/EditRoleRequest' },
          },
        },
      },
      responses: {
        200: {
          description: 'Role edited',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RoleMutationResponse' },
            },
          },
        },
      },
    },

    get: {
      tags: ['SuperAdmin Role Apis'],
      summary: 'List Roles (current behavior)',
      description:
        'Note: this endpoint is mounted as GET /superAdmin/role/:id in code but returns a list using query params. Swagger reflects current behavior without changing runtime routes.',
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        { name: 'limit', in: 'query', schema: { type: 'string' } },
        { name: 'offset', in: 'query', schema: { type: 'string' } },
        { name: 'searchKey', in: 'query', schema: { type: 'string' } },
        {
          name: 'status',
          in: 'query',
          schema: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
        },
      ],
      responses: {
        200: {
          description: 'Role list',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RoleListResponse' },
            },
          },
        },
      },
    },

    delete: {
      tags: ['SuperAdmin Role Apis'],
      summary: 'Remove Role',
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
      ],
      responses: {
        200: {
          description: 'Role removed',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RoleMutationResponse' },
            },
          },
        },
      },
    },
  },
};
