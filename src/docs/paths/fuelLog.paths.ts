import { errors } from './responses.js';

const fuelTypeEnum = ['PETROL', 'DIESEL'];
const equipmentCategoryEnum = ['VEHICLE', 'MACHINERY'];
const fuelDirectionEnum = ['CONSUMED', 'FILLED'];
const fuelTransactionEnum = ['REFILL', 'CONSUMED'];
const fuelEntityEnum = ['PROJECT_FUEL_TANK', 'VEHICLE', 'MACHINERY'];

const fuelLogObject = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    fuelType: { type: 'string', enum: fuelTypeEnum, example: 'DIESEL' },
    equipmentUniqueId: { type: 'string', example: 'VEH-1024' },
    equipmentCategory: {
      type: 'string',
      enum: equipmentCategoryEnum,
      example: 'VEHICLE',
    },
    equipmentType: { type: 'string', example: 'Tipper Truck' },
    date: { type: 'string', format: 'date-time' },
    fuelDirectionType: {
      type: 'string',
      enum: fuelDirectionEnum,
      example: 'FILLED',
    },
    transactionType: {
      type: 'string',
      enum: fuelTransactionEnum,
      example: 'REFILL',
    },
    fuelEntityType: {
      type: 'string',
      enum: fuelEntityEnum,
      example: 'PROJECT_FUEL_TANK',
    },
    fuelQuantity: { type: 'number', example: 60 },
    fuelUomId: { type: 'string', format: 'uuid' },
    projectId: { type: 'string', format: 'uuid', nullable: true },
    vehicleId: { type: 'string', format: 'uuid', nullable: true },
    machineryId: { type: 'string', format: 'uuid', nullable: true },
    inventoryFuelStockId: { type: 'string', format: 'uuid', nullable: true },
    inventoryFuelStock: {
      type: 'object',
      nullable: true,
      properties: {
        id: { type: 'string', format: 'uuid' },
        availableQuantity: { type: 'number', example: 140 },
        totalRefilledQuantity: { type: 'number', example: 200 },
        totalConsumedQuantity: { type: 'number', example: 60 },
      },
    },
    domainId: { type: 'string', format: 'uuid' },
    adminId: { type: 'string', format: 'uuid' },
    status: { type: 'string', example: 'ACTIVE' },
    isDeleted: { type: 'boolean', example: false },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

const createBodySchema = {
  type: 'object',
  required: [
    'fuelType',
    'date',
    'transactionType',
    'fuelEntityType',
    'fuelQuantity',
    'fuelUomId',
  ],
  properties: {
    fuelType: { type: 'string', enum: fuelTypeEnum, example: 'DIESEL' },
    equipmentUniqueId: {
      type: 'string',
      nullable: true,
      example: 'PROJECT-FUEL-TANK',
      description: 'Legacy searchable equipment identifier. Optional.',
    },
    equipmentCategory: {
      type: 'string',
      enum: equipmentCategoryEnum,
      nullable: true,
      example: 'VEHICLE',
      description: 'Legacy equipment category. Optional.',
    },
    equipmentType: {
      type: 'string',
      nullable: true,
      example: 'PROJECT_FUEL_TANK',
      description: 'Legacy equipment type. Optional.',
    },
    date: { type: 'string', example: '2026-06-12' },
    fuelDirectionType: {
      type: 'string',
      enum: fuelDirectionEnum,
      example: 'FILLED',
      description:
        'Legacy direction. Optional; derived from transactionType when omitted.',
    },
    transactionType: {
      type: 'string',
      enum: fuelTransactionEnum,
      example: 'REFILL',
      description:
        'REFILL adds fuel into the authenticated domain fuel tank. CONSUMED subtracts from it.',
    },
    fuelEntityType: {
      type: 'string',
      enum: fuelEntityEnum,
      example: 'PROJECT_FUEL_TANK',
      description:
        'Use PROJECT_FUEL_TANK for REFILL, VEHICLE or MACHINERY for CONSUMED.',
    },
    fuelQuantity: { type: 'number', minimum: 0, example: 60 },
    fuelUomId: { type: 'string', format: 'uuid' },
    projectId: {
      type: 'string',
      format: 'uuid',
      nullable: true,
      description:
        'Optional for REFILL. Required for VEHICLE or MACHINERY consumption.',
    },
    vehicleId: {
      type: 'string',
      format: 'uuid',
      nullable: true,
      description: 'Required when fuelEntityType is VEHICLE.',
    },
    machineryId: {
      type: 'string',
      format: 'uuid',
      nullable: true,
      description: 'Required when fuelEntityType is MACHINERY.',
    },
  },
};

const updateBodySchema = {
  type: 'object',
  description: 'At least one field is required.',
  properties: createBodySchema.properties,
};

const listQueryParams = [
  {
    in: 'query',
    name: 'offset',
    schema: { type: 'integer', minimum: 0 },
    description: 'Number of records to skip',
  },
  {
    in: 'query',
    name: 'limit',
    schema: { type: 'integer', minimum: 1, maximum: 100 },
    description: 'Page size (max 100)',
  },
  {
    in: 'query',
    name: 'fuelType',
    schema: { type: 'string', enum: fuelTypeEnum },
  },
  {
    in: 'query',
    name: 'equipmentCategory',
    schema: { type: 'string', enum: equipmentCategoryEnum },
  },
  {
    in: 'query',
    name: 'fuelDirectionType',
    schema: { type: 'string', enum: fuelDirectionEnum },
  },
  {
    in: 'query',
    name: 'transactionType',
    schema: { type: 'string', enum: fuelTransactionEnum },
  },
  {
    in: 'query',
    name: 'fuelEntityType',
    schema: { type: 'string', enum: fuelEntityEnum },
  },
  { in: 'query', name: 'equipmentUniqueId', schema: { type: 'string' } },
  {
    in: 'query',
    name: 'projectId',
    schema: { type: 'string', format: 'uuid' },
  },
  {
    in: 'query',
    name: 'fromDate',
    schema: { type: 'string' },
    description: 'Filter logs on/after this date',
  },
  {
    in: 'query',
    name: 'toDate',
    schema: { type: 'string' },
    description: 'Filter logs on/before this date',
  },
  { in: 'query', name: 'searchKey', schema: { type: 'string' } },
];

const idParam = {
  in: 'path',
  name: 'id',
  required: true,
  schema: { type: 'string', format: 'uuid' },
};

const successEnvelope = (message: string, data: object) => ({
  type: 'object',
  properties: {
    success: { type: 'boolean', example: true },
    message: { type: 'string', example: message },
    data,
  },
});

// Build the 5 CRUD operations for a given base path + swagger tag.
function buildFuelLogPaths(
  basePath: string,
  tag: string,
  createSchema: object = createBodySchema,
  updateSchema: object = updateBodySchema,
  queryParams: object[] = listQueryParams,
) {
  return {
    [basePath]: {
      post: {
        tags: [tag],
        summary: 'Create fuel log',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: createSchema } },
        },
        responses: {
          201: {
            description: 'Fuel log created successfully',
            content: {
              'application/json': {
                schema: successEnvelope(
                  'Fuel log created successfully',
                  fuelLogObject,
                ),
              },
            },
          },
          ...errors,
        },
      },
      get: {
        tags: [tag],
        summary: 'List fuel logs',
        description: 'Retrieve paginated, filterable fuel logs.',
        security: [{ bearerAuth: [] }],
        parameters: queryParams,
        responses: {
          200: {
            description: 'Fuel logs retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: {
                      type: 'string',
                      example: 'Fuel logs retrieved successfully',
                    },
                    pagination: {
                      type: 'object',
                      properties: {
                        totalCount: { type: 'integer', example: 42 },
                        offset: { type: 'integer', example: 0 },
                        limit: { type: 'integer', example: 10 },
                      },
                    },
                    data: { type: 'array', items: fuelLogObject },
                  },
                },
              },
            },
          },
          ...errors,
        },
      },
    },
    [`${basePath}/{id}`]: {
      get: {
        tags: [tag],
        summary: 'Get fuel log by id',
        security: [{ bearerAuth: [] }],
        parameters: [idParam],
        responses: {
          200: {
            description: 'Fuel log retrieved successfully',
            content: {
              'application/json': {
                schema: successEnvelope(
                  'Fuel log retrieved successfully',
                  fuelLogObject,
                ),
              },
            },
          },
          ...errors,
        },
      },
      put: {
        tags: [tag],
        summary: 'Update fuel log',
        security: [{ bearerAuth: [] }],
        parameters: [idParam],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: updateSchema } },
        },
        responses: {
          200: {
            description: 'Fuel log updated successfully',
            content: {
              'application/json': {
                schema: successEnvelope(
                  'Fuel log updated successfully',
                  fuelLogObject,
                ),
              },
            },
          },
          ...errors,
        },
      },
      delete: {
        tags: [tag],
        summary: 'Delete fuel log',
        description: 'Soft-deletes the fuel log.',
        security: [{ bearerAuth: [] }],
        parameters: [idParam],
        responses: {
          200: {
            description: 'Fuel log deleted successfully',
            content: {
              'application/json': {
                schema: successEnvelope('Fuel log deleted successfully', {
                  type: 'object',
                  nullable: true,
                  example: null,
                }),
              },
            },
          },
          ...errors,
        },
      },
    },
  };
}

export const FuelLogPaths = {
  ...buildFuelLogPaths('/api/domain/fuel-logs', 'Fuel Logs'),
  ...buildFuelLogPaths('/api/user/fuel-logs', 'User Fuel Logs'),
};
