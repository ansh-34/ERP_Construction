export const ModulePaths = {
  '/superAdmin/module': {
    post: {
      tags: ['SuperAdmin Module Apis'],
      summary: 'Create Module',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/AddModuleRequest',
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Module created successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ModuleMutationResponse',
              },
            },
          },
        },
      },
    },
  },

  '/superAdmin/module/{id}': {
    put: {
      tags: ['SuperAdmin Module Apis'],
      summary: 'Edit Module',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/EditModuleRequest',
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Module edited successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ModuleMutationResponse',
              },
            },
          },
        },
      },
    },

    get: {
      tags: ['SuperAdmin Module Apis'],
      summary: 'List Modules (current behavior)',
      description:
        'Note: this endpoint is mounted as GET /superAdmin/module/:id in code but returns a list using query params. Swagger reflects current behavior without changing runtime routes.',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' },
        },
        {
          name: 'limit',
          in: 'query',
          schema: { type: 'string' },
        },
        {
          name: 'offset',
          in: 'query',
          schema: { type: 'string' },
        },
        {
          name: 'searchKey',
          in: 'query',
          schema: { type: 'string' },
        },
        {
          name: 'status',
          in: 'query',
          schema: {
            type: 'string',
            enum: ['ACTIVE', 'INACTIVE'],
          },
        },
      ],
      responses: {
        200: {
          description: 'Module list',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ModuleListResponse',
              },
            },
          },
        },
      },
    },

    delete: {
      tags: ['SuperAdmin Module Apis'],
      summary: 'Remove Module',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' },
        },
      ],
      responses: {
        200: {
          description: 'Module deleted successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ModuleMutationResponse',
              },
            },
          },
        },
      },
    },
  },
};
