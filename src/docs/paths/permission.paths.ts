export const PermissionPaths = {
  '/superAdmin/permission': {
    post: {
      tags: ['SuperAdmin Permission Apis'],
      summary: 'Create Permission',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/AddPermissionRequest' },
          },
        },
      },
      responses: {
        200: {
          description: 'Permission created',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/PermissionMutationResponse',
              },
            },
          },
        },
      },
    },
  },

  '/superAdmin/permission/{id}': {
    put: {
      tags: ['SuperAdmin Permission Apis'],
      summary: 'Edit Permission',
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/EditPermissionRequest' },
          },
        },
      },
      responses: {
        200: {
          description: 'Permission edited',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/PermissionMutationResponse',
              },
            },
          },
        },
      },
    },

    get: {
      tags: ['SuperAdmin Permission Apis'],
      summary: 'List Permissions (current behavior)',
      description:
        'Note: this endpoint is mounted as GET /superAdmin/permission/:id in code but returns a list using query params. Swagger reflects current behavior without changing runtime routes.',
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
          description: 'Permission list',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PermissionListResponse' },
            },
          },
        },
      },
    },

    delete: {
      tags: ['SuperAdmin Permission Apis'],
      summary: 'Remove Permission',
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
      ],
      responses: {
        200: {
          description: 'Permission removed',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/PermissionMutationResponse',
              },
            },
          },
        },
      },
    },
  },
};
