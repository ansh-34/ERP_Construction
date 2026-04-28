export const RoleModulePermissionPaths = {
  '/superAdmin/roleModulePermission': {
    post: {
      tags: ['SuperAdmin RoleModulePermission Apis'],
      summary: 'Add Role Module Permissions',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/AddRoleModulePermissionRequest',
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Permissions saved',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/RoleModulePermissionMutationResponse',
              },
            },
          },
        },
      },
    },

    put: {
      tags: ['SuperAdmin RoleModulePermission Apis'],
      summary: 'Edit Role Module Permissions',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/EditRoleModulePermissionRequest',
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Permissions updated',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/RoleModulePermissionMutationResponse',
              },
            },
          },
        },
      },
    },

    get: {
      tags: ['SuperAdmin RoleModulePermission Apis'],
      summary: 'List Role Module Permissions',
      parameters: [
        { name: 'limit', in: 'query', schema: { type: 'string' } },
        { name: 'offset', in: 'query', schema: { type: 'string' } },
        { name: 'searchKey', in: 'query', schema: { type: 'string' } },
        { name: 'role_id', in: 'query', schema: { type: 'string' } },
        {
          name: 'status',
          in: 'query',
          schema: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
        },
      ],
      responses: {
        200: {
          description: 'Role module permission list',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/RoleModulePermissionListResponse',
              },
            },
          },
        },
      },
    },
  },
};
