export const CostCenterPaths = {
  '/api/domain/cost-centers': {
    post: {
      tags: ['Domain Cost Centers'],
      summary: 'Create cost center',
      security: [
        {
          bearerAuth: [],
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            example: {
              name: {
                en: 'Head Office',
              },
              description: 'Corporate cost center',
              industryCategoryIds: [],
              industryIds: [],
            },
          },
        },
      },
      responses: {
        '201': {
          description: 'Cost center created',
          content: {
            'application/json': {
              example: {
                success: true,
                message: 'Cost center created successfully',
                data: {
                  id: '701fcaee-9dfa-452d-b0bb-a69714788c91',
                  name: {
                    en: 'Head Office 1782794791',
                  },
                  code: 'HEAD_OFFICE_1782794791',
                  searchText: 'head office 1782794791 head_office_1782794791',
                  description: 'Corporate cost center',
                  parentId: null,
                  path: '701fcaee-9dfa-452d-b0bb-a69714788c91',
                  level: 0,
                  childrenCount: 0,
                  industryIds: [],
                  industryCategoryIds: [],
                  isSystem: false,
                  costCenterId: null,
                  projectId: null,
                  domainId: '32549b13-9fb7-44da-8f70-d943d997f956',
                  adminId: '1da16956-db58-4216-81f1-30ca54876913',
                  status: 'ACTIVE',
                  isDeleted: false,
                  createdAt: '2026-06-30T04:46:32.157Z',
                  updatedAt: '2026-06-30T04:46:32.157Z',
                },
              },
            },
          },
        },
        '400': {
          description: 'Bad Request',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '401': {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '403': {
          description: 'Forbidden',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '404': {
          description: 'Not Found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '500': {
          description: 'Server Error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
      },
      description:
        "industryCategoryIds (IndustryAccountCategory ids) and industryIds (IndustryAccount ids) are optional; when provided, those templates are cloned into this domain's AccountCategory/Account and linked to the new cost center.",
    },
    get: {
      tags: ['Domain Cost Centers'],
      summary: 'List cost centers',
      security: [
        {
          bearerAuth: [],
        },
      ],
      parameters: [
        {
          in: 'query',
          name: 'limit',
          schema: {
            type: 'integer',
            default: 10,
          },
        },
        {
          in: 'query',
          name: 'offset',
          schema: {
            type: 'integer',
            default: 0,
          },
        },
        {
          in: 'query',
          name: 'status',
          schema: {
            type: 'string',
            enum: ['ACTIVE', 'INACTIVE'],
          },
        },
        {
          in: 'query',
          name: 'searchKey',
          schema: {
            type: 'string',
          },
        },
        {
          in: 'query',
          name: 'parentId',
          schema: {
            type: 'string',
            format: 'uuid',
          },
        },
      ],
      responses: {
        '200': {
          description: 'Cost centers retrieved',
          content: {
            'application/json': {
              example: {
                success: true,
                message: 'Cost centers retrieved successfully',
                pagination: {
                  currentCount: 1,
                  totalCount: 1,
                  offset: 0,
                  limit: 10,
                },
                data: [
                  {
                    id: '701fcaee-9dfa-452d-b0bb-a69714788c91',
                    name: 'Head Office 1782794791',
                    code: 'HEAD_OFFICE_1782794791',
                    searchText: 'head office 1782794791 head_office_1782794791',
                    description: 'Corporate cost center',
                    parentId: null,
                    path: '701fcaee-9dfa-452d-b0bb-a69714788c91',
                    level: 0,
                    childrenCount: 0,
                    industryIds: [],
                    industryCategoryIds: [],
                    isSystem: false,
                    costCenterId: null,
                    projectId: null,
                    domainId: '32549b13-9fb7-44da-8f70-d943d997f956',
                    adminId: '1da16956-db58-4216-81f1-30ca54876913',
                    status: 'ACTIVE',
                    isDeleted: false,
                    createdAt: '2026-06-30T04:46:32.157Z',
                    updatedAt: '2026-06-30T04:46:32.157Z',
                    parent: null,
                    project: null,
                  },
                ],
              },
            },
          },
        },
        '400': {
          description: 'Bad Request',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '401': {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '403': {
          description: 'Forbidden',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '404': {
          description: 'Not Found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '500': {
          description: 'Server Error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
      },
    },
  },
  '/api/domain/cost-centers/{id}': {
    get: {
      tags: ['Domain Cost Centers'],
      summary: 'Get cost center by id',
      security: [
        {
          bearerAuth: [],
        },
      ],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'string',
            format: 'uuid',
          },
          description: 'Cost center ID',
        },
      ],
      responses: {
        '200': {
          description: 'Cost center retrieved',
          content: {
            'application/json': {
              example: {
                success: true,
                message: 'Cost center retrieved successfully',
                data: {
                  id: '701fcaee-9dfa-452d-b0bb-a69714788c91',
                  name: {
                    en: 'Head Office 1782794791',
                  },
                  code: 'HEAD_OFFICE_1782794791',
                  searchText: 'head office 1782794791 head_office_1782794791',
                  description: 'Corporate cost center',
                  parentId: null,
                  path: '701fcaee-9dfa-452d-b0bb-a69714788c91',
                  level: 0,
                  childrenCount: 0,
                  industryIds: [],
                  industryCategoryIds: [],
                  isSystem: false,
                  costCenterId: null,
                  projectId: null,
                  domainId: '32549b13-9fb7-44da-8f70-d943d997f956',
                  adminId: '1da16956-db58-4216-81f1-30ca54876913',
                  status: 'ACTIVE',
                  isDeleted: false,
                  createdAt: '2026-06-30T04:46:32.157Z',
                  updatedAt: '2026-06-30T04:46:32.157Z',
                  parent: null,
                  project: null,
                },
              },
            },
          },
        },
        '400': {
          description: 'Bad Request',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '401': {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '403': {
          description: 'Forbidden',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '404': {
          description: 'Not Found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '500': {
          description: 'Server Error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
      },
    },
    put: {
      tags: ['Domain Cost Centers'],
      summary: 'Update cost center',
      security: [
        {
          bearerAuth: [],
        },
      ],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'string',
            format: 'uuid',
          },
          description: 'Cost center ID',
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            example: {
              description: 'Updated corporate cost center',
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Cost center updated',
          content: {
            'application/json': {
              example: {
                success: true,
                message: 'Cost center updated successfully',
                data: {
                  id: '701fcaee-9dfa-452d-b0bb-a69714788c91',
                  name: {
                    en: 'Head Office 1782794791',
                  },
                  code: 'HEAD_OFFICE_1782794791',
                  searchText: 'head office 1782794791 head_office_1782794791',
                  description: 'Updated corporate cost center',
                  parentId: null,
                  path: '701fcaee-9dfa-452d-b0bb-a69714788c91',
                  level: 0,
                  childrenCount: 0,
                  industryIds: [],
                  industryCategoryIds: [],
                  isSystem: false,
                  costCenterId: null,
                  projectId: null,
                  domainId: '32549b13-9fb7-44da-8f70-d943d997f956',
                  adminId: '1da16956-db58-4216-81f1-30ca54876913',
                  status: 'ACTIVE',
                  isDeleted: false,
                  createdAt: '2026-06-30T04:46:32.157Z',
                  updatedAt: '2026-06-30T04:46:32.257Z',
                },
              },
            },
          },
        },
        '400': {
          description: 'Bad Request',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '401': {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '403': {
          description: 'Forbidden',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '404': {
          description: 'Not Found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '500': {
          description: 'Server Error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
      },
    },
    delete: {
      tags: ['Domain Cost Centers'],
      summary: 'Delete cost center',
      security: [
        {
          bearerAuth: [],
        },
      ],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'string',
            format: 'uuid',
          },
          description: 'Cost center ID',
        },
      ],
      responses: {
        '200': {
          description: 'Cost center deleted',
          content: {
            'application/json': {
              example: {
                success: true,
                message: 'Cost center deleted successfully',
                data: null,
              },
            },
          },
        },
        '400': {
          description: 'Bad Request',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '401': {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '403': {
          description: 'Forbidden',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '404': {
          description: 'Not Found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '500': {
          description: 'Server Error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
      },
    },
  },
  '/api/user/cost-centers': {
    post: {
      tags: ['User Cost Centers'],
      summary: 'Create cost center',
      security: [
        {
          bearerAuth: [],
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            example: {
              name: {
                en: 'Head Office',
              },
              description: 'Corporate cost center',
              industryCategoryIds: [],
              industryIds: [],
            },
          },
        },
      },
      responses: {
        '201': {
          description: 'Cost center created',
          content: {
            'application/json': {
              example: {
                success: true,
                message: 'Cost center created successfully',
                data: {
                  id: '701fcaee-9dfa-452d-b0bb-a69714788c91',
                  name: {
                    en: 'Head Office 1782794791',
                  },
                  code: 'HEAD_OFFICE_1782794791',
                  searchText: 'head office 1782794791 head_office_1782794791',
                  description: 'Corporate cost center',
                  parentId: null,
                  path: '701fcaee-9dfa-452d-b0bb-a69714788c91',
                  level: 0,
                  childrenCount: 0,
                  industryIds: [],
                  industryCategoryIds: [],
                  isSystem: false,
                  costCenterId: null,
                  projectId: null,
                  domainId: '32549b13-9fb7-44da-8f70-d943d997f956',
                  adminId: '1da16956-db58-4216-81f1-30ca54876913',
                  status: 'ACTIVE',
                  isDeleted: false,
                  createdAt: '2026-06-30T04:46:32.157Z',
                  updatedAt: '2026-06-30T04:46:32.157Z',
                },
              },
            },
          },
        },
        '400': {
          description: 'Bad Request',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '401': {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '403': {
          description: 'Forbidden',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '404': {
          description: 'Not Found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '500': {
          description: 'Server Error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
      },
      description:
        "industryCategoryIds (IndustryAccountCategory ids) and industryIds (IndustryAccount ids) are optional; when provided, those templates are cloned into this domain's AccountCategory/Account and linked to the new cost center.",
    },
    get: {
      tags: ['User Cost Centers'],
      summary: 'List cost centers',
      security: [
        {
          bearerAuth: [],
        },
      ],
      parameters: [
        {
          in: 'query',
          name: 'limit',
          schema: {
            type: 'integer',
            default: 10,
          },
        },
        {
          in: 'query',
          name: 'offset',
          schema: {
            type: 'integer',
            default: 0,
          },
        },
        {
          in: 'query',
          name: 'status',
          schema: {
            type: 'string',
            enum: ['ACTIVE', 'INACTIVE'],
          },
        },
        {
          in: 'query',
          name: 'searchKey',
          schema: {
            type: 'string',
          },
        },
        {
          in: 'query',
          name: 'parentId',
          schema: {
            type: 'string',
            format: 'uuid',
          },
        },
      ],
      responses: {
        '200': {
          description: 'Cost centers retrieved',
          content: {
            'application/json': {
              example: {
                success: true,
                message: 'Cost centers retrieved successfully',
                pagination: {
                  currentCount: 1,
                  totalCount: 1,
                  offset: 0,
                  limit: 10,
                },
                data: [
                  {
                    id: '701fcaee-9dfa-452d-b0bb-a69714788c91',
                    name: 'Head Office 1782794791',
                    code: 'HEAD_OFFICE_1782794791',
                    searchText: 'head office 1782794791 head_office_1782794791',
                    description: 'Corporate cost center',
                    parentId: null,
                    path: '701fcaee-9dfa-452d-b0bb-a69714788c91',
                    level: 0,
                    childrenCount: 0,
                    industryIds: [],
                    industryCategoryIds: [],
                    isSystem: false,
                    costCenterId: null,
                    projectId: null,
                    domainId: '32549b13-9fb7-44da-8f70-d943d997f956',
                    adminId: '1da16956-db58-4216-81f1-30ca54876913',
                    status: 'ACTIVE',
                    isDeleted: false,
                    createdAt: '2026-06-30T04:46:32.157Z',
                    updatedAt: '2026-06-30T04:46:32.157Z',
                    parent: null,
                    project: null,
                  },
                ],
              },
            },
          },
        },
        '400': {
          description: 'Bad Request',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '401': {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '403': {
          description: 'Forbidden',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '404': {
          description: 'Not Found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '500': {
          description: 'Server Error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
      },
    },
  },
  '/api/user/cost-centers/{id}': {
    get: {
      tags: ['User Cost Centers'],
      summary: 'Get cost center by id',
      security: [
        {
          bearerAuth: [],
        },
      ],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'string',
            format: 'uuid',
          },
          description: 'Cost center ID',
        },
      ],
      responses: {
        '200': {
          description: 'Cost center retrieved',
          content: {
            'application/json': {
              example: {
                success: true,
                message: 'Cost center retrieved successfully',
                data: {
                  id: '701fcaee-9dfa-452d-b0bb-a69714788c91',
                  name: {
                    en: 'Head Office 1782794791',
                  },
                  code: 'HEAD_OFFICE_1782794791',
                  searchText: 'head office 1782794791 head_office_1782794791',
                  description: 'Corporate cost center',
                  parentId: null,
                  path: '701fcaee-9dfa-452d-b0bb-a69714788c91',
                  level: 0,
                  childrenCount: 0,
                  industryIds: [],
                  industryCategoryIds: [],
                  isSystem: false,
                  costCenterId: null,
                  projectId: null,
                  domainId: '32549b13-9fb7-44da-8f70-d943d997f956',
                  adminId: '1da16956-db58-4216-81f1-30ca54876913',
                  status: 'ACTIVE',
                  isDeleted: false,
                  createdAt: '2026-06-30T04:46:32.157Z',
                  updatedAt: '2026-06-30T04:46:32.157Z',
                  parent: null,
                  project: null,
                },
              },
            },
          },
        },
        '400': {
          description: 'Bad Request',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '401': {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '403': {
          description: 'Forbidden',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '404': {
          description: 'Not Found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '500': {
          description: 'Server Error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
      },
    },
    put: {
      tags: ['User Cost Centers'],
      summary: 'Update cost center',
      security: [
        {
          bearerAuth: [],
        },
      ],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'string',
            format: 'uuid',
          },
          description: 'Cost center ID',
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            example: {
              description: 'Updated corporate cost center',
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Cost center updated',
          content: {
            'application/json': {
              example: {
                success: true,
                message: 'Cost center updated successfully',
                data: {
                  id: '701fcaee-9dfa-452d-b0bb-a69714788c91',
                  name: {
                    en: 'Head Office 1782794791',
                  },
                  code: 'HEAD_OFFICE_1782794791',
                  searchText: 'head office 1782794791 head_office_1782794791',
                  description: 'Updated corporate cost center',
                  parentId: null,
                  path: '701fcaee-9dfa-452d-b0bb-a69714788c91',
                  level: 0,
                  childrenCount: 0,
                  industryIds: [],
                  industryCategoryIds: [],
                  isSystem: false,
                  costCenterId: null,
                  projectId: null,
                  domainId: '32549b13-9fb7-44da-8f70-d943d997f956',
                  adminId: '1da16956-db58-4216-81f1-30ca54876913',
                  status: 'ACTIVE',
                  isDeleted: false,
                  createdAt: '2026-06-30T04:46:32.157Z',
                  updatedAt: '2026-06-30T04:46:32.257Z',
                },
              },
            },
          },
        },
        '400': {
          description: 'Bad Request',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '401': {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '403': {
          description: 'Forbidden',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '404': {
          description: 'Not Found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '500': {
          description: 'Server Error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
      },
    },
    delete: {
      tags: ['User Cost Centers'],
      summary: 'Delete cost center',
      security: [
        {
          bearerAuth: [],
        },
      ],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'string',
            format: 'uuid',
          },
          description: 'Cost center ID',
        },
      ],
      responses: {
        '200': {
          description: 'Cost center deleted',
          content: {
            'application/json': {
              example: {
                success: true,
                message: 'Cost center deleted successfully',
                data: null,
              },
            },
          },
        },
        '400': {
          description: 'Bad Request',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '401': {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '403': {
          description: 'Forbidden',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '404': {
          description: 'Not Found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '500': {
          description: 'Server Error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
      },
    },
  },
};
