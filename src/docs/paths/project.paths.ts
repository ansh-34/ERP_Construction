import { errors } from './responses.js';

const languageHeader = {
  in: 'header' as const,
  name: 'language',
  schema: { type: 'string', default: 'en', example: 'en' },
};

const searchQuery = {
  in: 'query' as const,
  name: 'searchKey',
  schema: { type: 'string' },
};

const projectIdQuery = {
  in: 'query' as const,
  name: 'projectId',
  schema: { type: 'string', format: 'uuid' },
};

const stageIdQuery = {
  in: 'query' as const,
  name: 'stageId',
  schema: { type: 'string', format: 'uuid' },
};

const taskIdQuery = {
  in: 'query' as const,
  name: 'taskId',
  schema: { type: 'string', format: 'uuid' },
};

const domainIdQuery = {
  in: 'query' as const,
  name: 'domainId',
  required: true,
  schema: { type: 'string', format: 'uuid' },
};

const userIdQuery = {
  in: 'query' as const,
  name: 'userId',
  schema: { type: 'string', format: 'uuid' },
};

const statusQuery = {
  in: 'query' as const,
  name: 'status',
  schema: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
};

const approvalStateQuery = {
  in: 'query' as const,
  name: 'approvalState',
  schema: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED'] },
};

const dateQuery = (name: string) => ({
  in: 'query' as const,
  name,
  schema: { type: 'string', example: '2026-05-18' },
});

const paginationParams = [
  {
    in: 'query' as const,
    name: 'offset',
    schema: { type: 'integer', minimum: 0, default: 0 },
  },
  {
    in: 'query' as const,
    name: 'limit',
    schema: { type: 'integer', minimum: 1, default: 10 },
  },
];

const idParam = (description: string) => ({
  in: 'path' as const,
  name: 'id',
  required: true,
  schema: { type: 'string', format: 'uuid' },
  description,
});

const listResponse = (schemaName: string, message: string) => ({
  200: {
    description: message,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: message },
            pagination: {
              type: 'object',
              properties: {
                currentCount: { type: 'integer', example: 2 },
                totalCount: { type: 'integer', example: 12 },
                offset: { type: 'integer', example: 0 },
                limit: { type: 'integer', example: 10 },
              },
            },
            data: {
              type: 'array',
              items: { $ref: `#/components/schemas/${schemaName}` },
            },
          },
        },
      },
    },
  },
  ...errors,
});

const itemResponse = (schemaName: string, message: string) => ({
  200: {
    description: message,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: message },
            data: { $ref: `#/components/schemas/${schemaName}` },
          },
        },
      },
    },
  },
  ...errors,
});

const crudPaths = ({
  basePath,
  tag,
  objectSchema,
  createSchema,
  updateSchema,
  entityName,
  listParameters,
  detailParameters = [],
}: {
  basePath: string;
  tag: string;
  objectSchema: string;
  createSchema: string;
  updateSchema?: string;
  entityName: string;
  listParameters: any[];
  detailParameters?: any[];
}) => ({
  [basePath]: {
    get: {
      tags: [tag],
      summary: `List ${entityName}`,
      security: [{ bearerAuth: [] }],
      parameters: [languageHeader, ...paginationParams, ...listParameters],
      responses: listResponse(objectSchema, `${entityName} retrieved`),
    },
    post: {
      tags: [tag],
      summary: `Create ${entityName}`,
      security: [{ bearerAuth: [] }],
      parameters: [languageHeader],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: `#/components/schemas/${createSchema}` },
          },
        },
      },
      responses: itemResponse(objectSchema, `${entityName} created`),
    },
  },
  [`${basePath}/{id}`]: {
    get: {
      tags: [tag],
      summary: `Get ${entityName} by ID`,
      security: [{ bearerAuth: [] }],
      parameters: [
        languageHeader,
        idParam(`${entityName} ID`),
        ...detailParameters,
      ],
      responses: itemResponse(objectSchema, `${entityName} retrieved`),
    },
    put: {
      tags: [tag],
      summary: `Update ${entityName}`,
      security: [{ bearerAuth: [] }],
      parameters: [
        languageHeader,
        idParam(`${entityName} ID`),
        ...detailParameters,
      ],
      requestBody: updateSchema
        ? {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: `#/components/schemas/${updateSchema}` },
              },
            },
          }
        : undefined,
      responses: itemResponse(objectSchema, `${entityName} updated`),
    },
    delete: {
      tags: [tag],
      summary: `Delete ${entityName}`,
      security: [{ bearerAuth: [] }],
      parameters: [idParam(`${entityName} ID`), ...detailParameters],
      responses: {
        200: { description: `${entityName} deleted` },
        204: { description: `${entityName} deleted` },
        ...errors,
      },
    },
  },
});

export const ProjectPaths = {
  '/api/domain/projects/analytics': {
    get: {
      tags: ['Domain Projects'],
      summary: 'Get project analytics',
      security: [{ bearerAuth: [] }],
      responses: itemResponse(
        'ProjectAnalyticsObject',
        'Project analytics retrieved',
      ),
    },
  },
  ...crudPaths({
    basePath: '/api/domain/projects',
    tag: 'Domain Projects',
    objectSchema: 'ProjectObject',
    createSchema: 'CreateProjectBody',
    updateSchema: 'UpdateProjectBody',
    entityName: 'Projects',
    listParameters: [domainIdQuery, searchQuery],
    detailParameters: [domainIdQuery],
  }),
  '/api/domain/projects/tasks/submission': {
    get: {
      tags: ['Domain Project Task Submissions'],
      summary: 'List project task submissions',
      security: [{ bearerAuth: [] }],
      parameters: [
        languageHeader,
        ...paginationParams,
        projectIdQuery,
        stageIdQuery,
        taskIdQuery,
        userIdQuery,
        approvalStateQuery,
        searchQuery,
      ],
      responses: listResponse(
        'ProjectTaskSubmissionObject',
        'Project task submissions retrieved',
      ),
    },
    post: {
      tags: ['Domain Project Task Submissions'],
      summary: 'Submit a project task',
      security: [{ bearerAuth: [] }],
      parameters: [languageHeader],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/SubmitProjectTaskBody' },
          },
        },
      },
      responses: itemResponse(
        'ProjectTaskSubmissionObject',
        'Project task submitted',
      ),
    },
  },
  '/api/domain/projects/tasks/submission/action': {
    put: {
      tags: ['Domain Project Task Submissions'],
      summary: 'Approve or reject project task submissions',
      security: [{ bearerAuth: [] }],
      parameters: [languageHeader],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ProjectTaskActionBody' },
          },
        },
      },
      responses: listResponse(
        'ProjectTaskSubmissionObject',
        'Project task submission action completed',
      ),
    },
  },
  '/api/domain/projects/tasks/delay/action': {
    put: {
      tags: ['Domain Project Task Delays'],
      summary: 'Approve or reject project task delay requests',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ProjectTaskActionBody' },
          },
        },
      },
      responses: listResponse(
        'ProjectTaskDelayObject',
        'Project task delay action completed',
      ),
    },
  },
  ...crudPaths({
    basePath: '/api/domain/project-stages',
    tag: 'Domain Project Stages',
    objectSchema: 'ProjectStageObject',
    createSchema: 'CreateDomainProjectStageBody',
    updateSchema: 'UpdateProjectStageBody',
    entityName: 'Project stages',
    listParameters: [domainIdQuery, projectIdQuery, searchQuery],
    detailParameters: [domainIdQuery],
  }),
  ...crudPaths({
    basePath: '/api/domain/project-tasks',
    tag: 'Domain Project Tasks',
    objectSchema: 'ProjectTaskObject',
    createSchema: 'CreateDomainProjectTaskBody',
    updateSchema: 'UpdateProjectTaskBody',
    entityName: 'Project tasks',
    listParameters: [domainIdQuery, projectIdQuery, stageIdQuery, searchQuery],
    detailParameters: [domainIdQuery],
  }),
  '/api/domain/project-tasks/approval': {
    put: {
      tags: ['Domain Project Tasks'],
      summary: 'Approve or reject project tasks',
      security: [{ bearerAuth: [] }],
      parameters: [languageHeader],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ProjectTaskApprovalBody' },
          },
        },
      },
      responses: listResponse(
        'ProjectTaskObject',
        'Project task approval updated',
      ),
    },
  },
  ...crudPaths({
    basePath: '/api/domain/project-task-delays',
    tag: 'Domain Project Task Delays',
    objectSchema: 'ProjectTaskDelayObject',
    createSchema: 'CreateDomainProjectTaskDelayBody',
    updateSchema: 'UpdateProjectTaskDelayBody',
    entityName: 'Project task delays',
    listParameters: [
      domainIdQuery,
      projectIdQuery,
      stageIdQuery,
      taskIdQuery,
      searchQuery,
    ],
    detailParameters: [domainIdQuery],
  }),
  ...crudPaths({
    basePath: '/api/domain/project-user-assignments',
    tag: 'Domain Project User Assignments',
    objectSchema: 'ProjectUserAssignmentObject',
    createSchema: 'CreateProjectUserAssignmentBody',
    updateSchema: 'UpdateProjectUserAssignmentBody',
    entityName: 'Project user assignments',
    listParameters: [
      projectIdQuery,
      userIdQuery,
      dateQuery('startDate'),
      dateQuery('endDate'),
      dateQuery('currentDate'),
      searchQuery,
    ],
  }),
  ...crudPaths({
    basePath: '/api/domain/project-user-daily-logs',
    tag: 'Domain Project User Daily Logs',
    objectSchema: 'ProjectUserDailyLogObject',
    createSchema: 'CreateProjectUserDailyLogBody',
    updateSchema: 'UpdateProjectUserDailyLogBody',
    entityName: 'Project user daily logs',
    listParameters: [
      projectIdQuery,
      userIdQuery,
      dateQuery('date'),
      dateQuery('startDate'),
      dateQuery('endDate'),
      searchQuery,
    ],
  }),
  '/api/domain/project-task-images': {
    get: {
      tags: ['Domain Project Task Images'],
      summary: 'List project task images',
      security: [{ bearerAuth: [] }],
      parameters: [languageHeader, ...paginationParams, taskIdQuery],
      responses: listResponse(
        'ProjectTaskImageObject',
        'Project task images retrieved',
      ),
    },
    post: {
      tags: ['Domain Project Task Images'],
      summary: 'Create project task image',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateProjectTaskImageBody' },
          },
        },
      },
      responses: itemResponse(
        'ProjectTaskImageObject',
        'Project task image created',
      ),
    },
  },
  '/api/domain/project-task-images/{id}': {
    delete: {
      tags: ['Domain Project Task Images'],
      summary: 'Delete project task image',
      security: [{ bearerAuth: [] }],
      parameters: [idParam('Project task image ID')],
      responses: itemResponse(
        'ProjectTaskImageObject',
        'Project task image deleted',
      ),
    },
  },
  ...crudPaths({
    basePath: '/api/domain/machineries',
    tag: 'Machinery',
    objectSchema: 'MachineryObject',
    createSchema: 'MachineryObject',
    updateSchema: 'MachineryObject',
    entityName: 'Machinery',
    listParameters: [projectIdQuery, searchQuery],
  }),
  '/api/domain/machine-reading': {
    get: {
      tags: ['Machine Reading'],
      summary: 'List machine readings',
      security: [{ bearerAuth: [] }],
      parameters: [languageHeader, projectIdQuery, searchQuery],
      responses: listResponse(
        'MachineReadingObject',
        'Machine readings retrieved',
      ),
    },
    post: {
      tags: ['Machine Reading'],
      summary: 'Create machine reading',
      security: [{ bearerAuth: [] }],
      parameters: [languageHeader],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/MachineReadingObject' },
          },
        },
      },
      responses: itemResponse(
        'MachineReadingObject',
        'Machine reading created',
      ),
    },
  },
  '/api/domain/machine-reading/{id}': {
    get: {
      tags: ['Machine Reading'],
      summary: 'Get machine reading by ID',
      security: [{ bearerAuth: [] }],
      parameters: [languageHeader, idParam('Machine reading ID')],
      responses: itemResponse(
        'MachineReadingObject',
        'Machine reading retrieved',
      ),
    },
    put: {
      tags: ['Machine Reading'],
      summary: 'Update machine reading',
      security: [{ bearerAuth: [] }],
      parameters: [languageHeader, idParam('Machine reading ID')],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/MachineReadingObject' },
          },
        },
      },
      responses: itemResponse(
        'MachineReadingObject',
        'Machine reading updated',
      ),
    },
  },
  '/api/domain/currency': {
    get: {
      tags: ['Domain Currency'],
      summary: 'List domain currencies',
      security: [{ bearerAuth: [] }],
      parameters: [languageHeader, searchQuery],
      responses: listResponse('CurrencyObject', 'Currencies retrieved'),
    },
  },
  '/api/domain/currency/{id}': {
    get: {
      tags: ['Domain Currency'],
      summary: 'Get domain currency by ID',
      security: [{ bearerAuth: [] }],
      parameters: [languageHeader, idParam('Currency ID')],
      responses: itemResponse('CurrencyObject', 'Currencies retrieved'),
    },
  },
  '/api/user/currency': {
    get: {
      tags: ['User Currency'],
      summary: 'List user currencies',
      security: [{ bearerAuth: [] }],
      parameters: [languageHeader, searchQuery],
      responses: listResponse('UserCurrencyObject', 'Currencies retrieved'),
    },
  },
  '/api/user/currency/{id}': {
    get: {
      tags: ['User Currency'],
      summary: 'Get user currency by ID',
      security: [{ bearerAuth: [] }],
      parameters: [languageHeader, idParam('Currency ID')],
      responses: itemResponse('UserCurrencyObject', 'Currencies retrieved'),
    },
  },
  ...crudPaths({
    basePath: '/api/user/projects',
    tag: 'User Projects',
    objectSchema: 'ProjectObject',
    createSchema: 'CreateProjectBody',
    updateSchema: 'UpdateProjectBody',
    entityName: 'User projects',
    listParameters: [statusQuery, searchQuery],
  }),
  '/api/user/projects/my-projects': {
    get: {
      tags: ['User Projects'],
      summary: 'List projects assigned to the authenticated user',
      security: [{ bearerAuth: [] }],
      parameters: [
        languageHeader,
        ...paginationParams,
        statusQuery,
        searchQuery,
      ],
      responses: listResponse(
        'ProjectObject',
        'User assigned projects retrieved',
      ),
    },
  },
  ...crudPaths({
    basePath: '/api/user/project-stages',
    tag: 'User Project Stages',
    objectSchema: 'ProjectStageObject',
    createSchema: 'CreateProjectStageBody',
    updateSchema: 'UpdateProjectStageBody',
    entityName: 'User project stages',
    listParameters: [searchQuery],
  }),
  ...crudPaths({
    basePath: '/api/user/project-tasks',
    tag: 'User Project Tasks',
    objectSchema: 'ProjectTaskObject',
    createSchema: 'CreateProjectTaskBody',
    updateSchema: 'UpdateProjectTaskBody',
    entityName: 'User project tasks',
    listParameters: [projectIdQuery, stageIdQuery, searchQuery],
  }),
  ...crudPaths({
    basePath: '/api/user/project-task-delays',
    tag: 'User Project Task Delays',
    objectSchema: 'ProjectTaskDelayObject',
    createSchema: 'CreateProjectTaskDelayBody',
    updateSchema: 'UpdateProjectTaskDelayBody',
    entityName: 'User project task delays',
    listParameters: [projectIdQuery, stageIdQuery, taskIdQuery, searchQuery],
  }),
  ...crudPaths({
    basePath: '/api/user/project-user-assignments',
    tag: 'User Project User Assignments',
    objectSchema: 'ProjectUserAssignmentObject',
    createSchema: 'CreateProjectUserAssignmentBody',
    updateSchema: 'UpdateProjectUserAssignmentBody',
    entityName: 'User project user assignments',
    listParameters: [
      projectIdQuery,
      userIdQuery,
      dateQuery('startDate'),
      dateQuery('endDate'),
      dateQuery('currentDate'),
      searchQuery,
    ],
  }),
  ...crudPaths({
    basePath: '/api/user/project-user-daily-logs',
    tag: 'User Project User Daily Logs',
    objectSchema: 'ProjectUserDailyLogObject',
    createSchema: 'CreateProjectUserDailyLogBody',
    updateSchema: 'UpdateProjectUserDailyLogBody',
    entityName: 'User project user daily logs',
    listParameters: [
      projectIdQuery,
      userIdQuery,
      dateQuery('date'),
      dateQuery('startDate'),
      dateQuery('endDate'),
      searchQuery,
    ],
  }),
  '/api/user/project-task-images': {
    get: {
      tags: ['User Project Task Images'],
      summary: 'List project task images',
      security: [{ bearerAuth: [] }],
      parameters: [languageHeader, ...paginationParams, taskIdQuery],
      responses: listResponse(
        'ProjectTaskImageObject',
        'Project task images retrieved',
      ),
    },
    post: {
      tags: ['User Project Task Images'],
      summary: 'Create project task image',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateProjectTaskImageBody' },
          },
        },
      },
      responses: itemResponse(
        'ProjectTaskImageObject',
        'Project task image created',
      ),
    },
  },
  '/api/user/project-task-images/{id}': {
    delete: {
      tags: ['User Project Task Images'],
      summary: 'Delete project task image',
      security: [{ bearerAuth: [] }],
      parameters: [idParam('Project task image ID')],
      responses: itemResponse(
        'ProjectTaskImageObject',
        'Project task image deleted',
      ),
    },
  },
  '/api/user/task-submission/{id}/submit': {
    put: {
      tags: ['User Task Submission'],
      summary: 'Submit a task assigned to the authenticated user',
      security: [{ bearerAuth: [] }],
      parameters: [languageHeader, idParam('Project task ID')],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UserSubmitTaskBody' },
          },
        },
      },
      responses: itemResponse(
        'ProjectTaskSubmissionObject',
        'Project task submitted',
      ),
    },
  },
};
