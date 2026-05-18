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
}: {
  basePath: string;
  tag: string;
  objectSchema: string;
  createSchema: string;
  updateSchema?: string;
  entityName: string;
  listParameters: any[];
}) => ({
  [basePath]: {
    get: {
      tags: [tag],
      summary: `List ${entityName}`,
      security: [{ bearerAuth: [] }],
      parameters: [languageHeader, ...listParameters],
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
      parameters: [languageHeader, idParam(`${entityName} ID`)],
      responses: itemResponse(objectSchema, `${entityName} retrieved`),
    },
    put: {
      tags: [tag],
      summary: `Update ${entityName}`,
      security: [{ bearerAuth: [] }],
      parameters: [languageHeader, idParam(`${entityName} ID`)],
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
      parameters: [idParam(`${entityName} ID`)],
      responses: {
        200: { description: `${entityName} deleted` },
        204: { description: `${entityName} deleted` },
        ...errors,
      },
    },
  },
});

export const ProjectPaths = {
  ...crudPaths({
    basePath: '/api/domain/projects',
    tag: 'Domain Projects',
    objectSchema: 'ProjectObject',
    createSchema: 'CreateProjectBody',
    updateSchema: 'UpdateProjectBody',
    entityName: 'Projects',
    listParameters: [searchQuery],
  }),
  ...crudPaths({
    basePath: '/api/domain/project-stages',
    tag: 'Domain Project Stages',
    objectSchema: 'ProjectStageObject',
    createSchema: 'CreateProjectStageBody',
    updateSchema: 'CreateProjectStageBody',
    entityName: 'Project stages',
    listParameters: [projectIdQuery, searchQuery],
  }),
  ...crudPaths({
    basePath: '/api/domain/project-tasks',
    tag: 'Domain Project Tasks',
    objectSchema: 'ProjectTaskObject',
    createSchema: 'CreateProjectTaskBody',
    updateSchema: 'CreateProjectTaskBody',
    entityName: 'Project tasks',
    listParameters: [projectIdQuery, stageIdQuery, searchQuery],
  }),
  ...crudPaths({
    basePath: '/api/domain/project-task-delays',
    tag: 'Domain Project Task Delays',
    objectSchema: 'ProjectTaskDelayObject',
    createSchema: 'CreateProjectTaskDelayBody',
    updateSchema: 'CreateProjectTaskDelayBody',
    entityName: 'Project task delays',
    listParameters: [
      projectIdQuery,
      stageIdQuery,
      taskIdQuery,
      searchQuery,
    ],
  }),
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
      parameters: [
        languageHeader,
        idParam('Machine reading ID'),
      ],
      responses: itemResponse(
        'MachineReadingObject',
        'Machine reading retrieved',
      ),
    },
    put: {
      tags: ['Machine Reading'],
      summary: 'Update machine reading',
      security: [{ bearerAuth: [] }],
      parameters: [
        languageHeader,
        idParam('Machine reading ID'),
      ],
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
    listParameters: [searchQuery],
  }),
  ...crudPaths({
    basePath: '/api/user/project-stages',
    tag: 'User Project Stages',
    objectSchema: 'ProjectStageObject',
    createSchema: 'CreateProjectStageBody',
    updateSchema: 'CreateProjectStageBody',
    entityName: 'User project stages',
    listParameters: [projectIdQuery, searchQuery],
  }),
  ...crudPaths({
    basePath: '/api/user/project-tasks',
    tag: 'User Project Tasks',
    objectSchema: 'ProjectTaskObject',
    createSchema: 'CreateProjectTaskBody',
    updateSchema: 'CreateProjectTaskBody',
    entityName: 'User project tasks',
    listParameters: [projectIdQuery, stageIdQuery, searchQuery],
  }),
  ...crudPaths({
    basePath: '/api/user/project-task-delays',
    tag: 'User Project Task Delays',
    objectSchema: 'ProjectTaskDelayObject',
    createSchema: 'CreateProjectTaskDelayBody',
    updateSchema: 'CreateProjectTaskDelayBody',
    entityName: 'User project task delays',
    listParameters: [projectIdQuery, stageIdQuery, taskIdQuery, searchQuery],
  }),
};
