import { errors } from './responses.js';

const idParam = {
  in: 'path' as const,
  name: 'id',
  required: true,
  schema: { type: 'string', format: 'uuid' },
  description: 'Weigh bridge record ID',
};

const langHeader = {
  in: 'header' as const,
  name: 'lang',
  schema: { type: 'string', example: 'en' },
  description:
    'Language code (e.g. en, hi). When sent, project.name is flattened to that language string (falls back to en). When omitted, project.name is returned as raw JSON {"en":"..."} — except the Domain list endpoint, which defaults to flat English.',
};

const listParams = [
  { in: 'query', name: 'limit', schema: { type: 'integer', default: 10 } },
  { in: 'query', name: 'offset', schema: { type: 'integer', default: 0 } },
  {
    in: 'query',
    name: 'status',
    schema: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
  },
  {
    in: 'query',
    name: 'weighBridgeStatus',
    schema: { type: 'string' },
  },
  {
    in: 'query',
    name: 'projectId',
    schema: { type: 'string', format: 'uuid' },
  },
  {
    in: 'query',
    name: 'searchKey',
    schema: { type: 'string' },
    description:
      'Case-insensitive partial match on ticketNumber, driverName, vehicleNo, supplier, gateNoteNo, operatorName',
  },
  langHeader,
];

const wbExample = {
  id: 'adda24da-6aba-48dd-bb49-addcb06e7f03',
  ticketNumber: 'WB-0003',
  date: '2026-06-27T06:23:04.958Z',
  driverName: 'Rajesh Kumar',
  vehicleNo: 'GJ01AB1234',
  supplier: 'Steel Corp India',
  material: 'Iron Ore',
  gateNoteNo: 'GN-2026-001',
  tareWeight: '8500',
  grossWeight: '25000',
  weighBridgeStatus: 'PENDING',
  operatorId: '91e4f3c9-2a20-4de4-9e00-8ccf2f2f1998',
  operatorName: 'Test User',
  remarks: 'First weighbridge entry',
  projectId: '88888888-8888-8888-8888-888888888801',
  domainId: '32549b13-9fb7-44da-8f70-d943d997f956',
  adminId: '1da16956-db58-4216-81f1-30ca54876913',
  status: 'ACTIVE',
  isDeleted: false,
  createdAt: '2026-06-27T06:23:04.960Z',
  updatedAt: '2026-06-27T06:23:04.960Z',
  project: {
    id: '88888888-8888-8888-8888-888888888801',
    name: { en: 'Test Project' },
    code: 'PROJ-1',
  },
  operator: {
    id: '91e4f3c9-2a20-4de4-9e00-8ccf2f2f1998',
    name: 'Test User',
    email: 'user@example.com',
  },
};

const buildPaths = (base: string, tags: string[], listLangDefault: string) => ({
  [base]: {
    post: {
      tags,
      summary: 'Create weigh bridge record',
      description: [
        '`ticketNumber` — optional, auto-generated as WB-0001, WB-0002… per domain if omitted.',
        '`operatorName` — auto-fetched from the User table using `operatorId`; do not send it.',
        'A `404 Operator not found` is returned if `operatorId` does not match an active user in the domain.',
      ].join(' '),
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/WeighBridgeCreateBody' },
            example: {
              driverName: 'Rajesh Kumar',
              vehicleNo: 'GJ01AB1234',
              supplier: 'Steel Corp India',
              material: 'Iron Ore',
              gateNoteNo: 'GN-2026-001',
              tareWeight: '8500',
              grossWeight: '25000',
              weighBridgeStatus: 'PENDING',
              operatorId: '91e4f3c9-2a20-4de4-9e00-8ccf2f2f1998',
              projectId: '88888888-8888-8888-8888-888888888801',
              remarks: 'First weighbridge entry',
            },
          },
        },
      },
      responses: {
        201: {
          description: 'Weigh bridge record created successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/WeighBridgeSingleResponse',
              },
              example: {
                success: true,
                message: 'Weigh bridge record created successfully',
                data: wbExample,
              },
            },
          },
        },
        ...errors,
      },
    },
    get: {
      tags,
      summary: 'List weigh bridge records',
      description: `Supports pagination plus status, weighBridgeStatus, projectId and searchKey filters. ${listLangDefault}`,
      security: [{ bearerAuth: [] }],
      parameters: listParams,
      responses: {
        200: {
          description: 'Weigh bridge records retrieved successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/WeighBridgeListResponse' },
              example: {
                success: true,
                message: 'Weigh bridge records retrieved successfully',
                pagination: {
                  currentCount: 1,
                  totalCount: 1,
                  offset: 0,
                  limit: 10,
                },
                data: [wbExample],
              },
            },
          },
        },
        ...errors,
      },
    },
  },

  [`${base}/{id}`]: {
    get: {
      tags,
      summary: 'Get weigh bridge record by ID',
      description:
        'Returns project.name as a raw JSON object unless a `lang` header is passed (then flattened to that language).',
      security: [{ bearerAuth: [] }],
      parameters: [idParam, langHeader],
      responses: {
        200: {
          description: 'Weigh bridge record retrieved successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/WeighBridgeSingleResponse',
              },
              example: {
                success: true,
                message: 'Weigh bridge record retrieved successfully',
                data: wbExample,
              },
            },
          },
        },
        ...errors,
      },
    },
    put: {
      tags,
      summary: 'Update weigh bridge record',
      description:
        'All fields optional. Sending `operatorId` re-fetches and updates `operatorName`.',
      security: [{ bearerAuth: [] }],
      parameters: [idParam],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/WeighBridgeUpdateBody' },
            example: {
              weighBridgeStatus: 'COMPLETED',
              grossWeight: '26500',
              remarks: 'Updated after recheck',
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Weigh bridge record updated successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/WeighBridgeSingleResponse',
              },
              example: {
                success: true,
                message: 'Weigh bridge record updated successfully',
                data: {
                  ...wbExample,
                  grossWeight: '26500',
                  weighBridgeStatus: 'COMPLETED',
                  remarks: 'Updated after recheck',
                },
              },
            },
          },
        },
        ...errors,
      },
    },
    delete: {
      tags,
      summary: 'Delete weigh bridge record (soft delete)',
      security: [{ bearerAuth: [] }],
      parameters: [idParam],
      responses: {
        200: {
          description: 'Weigh bridge record deleted successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/WeighBridgeDeleteResponse',
              },
              example: {
                success: true,
                message: 'Weigh bridge record deleted successfully',
                data: null,
              },
            },
          },
        },
        ...errors,
      },
    },
  },
});

export const WeighBridgePaths = {
  ...buildPaths(
    '/api/domain/weigh-bridges',
    ['Domain Weigh Bridges'],
    'Defaults to flat English project.name; pass a `lang` header to switch language.',
  ),
  ...buildPaths(
    '/api/user/weigh-bridges',
    ['User Weigh Bridges'],
    'Returns project.name as a raw JSON object unless a `lang` header is passed.',
  ),
};
