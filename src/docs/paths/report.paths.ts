import { errors } from './responses.js';

const adminDomainScopeParams = [
  {
    in: 'query',
    name: 'domainIds',
    required: false,
    style: 'form',
    explode: true,
    schema: {
      type: 'array',
      items: { type: 'string', format: 'uuid' },
    },
    description: 'Filter report by one or more domain IDs (comma-separated or multiple parameters)',
  },
  {
    in: 'query',
    name: 'search',
    required: false,
    schema: { type: 'string' },
    description: 'Search term to filter the domains',
  },
];

const domainRefSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid', example: 'd3b07384-d113-4ec6-a558-7132194685ff' },
    name: { type: 'string', example: 'Apex Construction Ltd' },
  },
};

export const ReportPaths = {
  '/api/domain/report/machine-summary': {
    get: {
      tags: ['Reports'],
      summary: 'Get Machine Summary Report',
      description:
        'Returns machines and machine readings, optionally filtered by projectId or machineryId.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'query',
          name: 'projectId',
          required: false,
          schema: { type: 'string', format: 'uuid' },
          description: 'Filter machines/readings by project ID',
        },
        {
          in: 'query',
          name: 'machineryId',
          required: false,
          schema: { type: 'string', format: 'uuid' },
          description: 'Filter report for one machinery record',
        },
      ],
      responses: {
        200: {
          description: 'Report fetched successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'Report fetched successfully',
                  },
                  data: {
                    type: 'object',
                    properties: {
                      machines: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            projectCode: { type: 'string', example: 'PRJ001' },
                            projectName: {
                              type: 'string',
                              example: 'Bridge Construction',
                            },
                            machineCode: { type: 'string', example: 'MC-001' },
                            machineType: {
                              type: 'string',
                              example: 'Excavator',
                            },
                            expectedLitrePerHour: {
                              type: 'number',
                              example: 12.5,
                            },
                            status: { type: 'string', example: 'ACTIVE' },
                            createdAt: {
                              type: 'string',
                              format: 'date-time',
                            },
                            updatedAt: {
                              type: 'string',
                              format: 'date-time',
                            },
                          },
                        },
                      },
                      machineReadings: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            projectCode: { type: 'string', example: 'PRJ001' },
                            projectName: {
                              type: 'string',
                              example: 'Bridge Construction',
                            },
                            machineCode: { type: 'string', example: 'MC-001' },
                            machineType: {
                              type: 'string',
                              example: 'Excavator',
                            },
                            readingCode: {
                              type: 'string',
                              example: 'MR-001',
                            },
                            readingDate: {
                              type: 'string',
                              format: 'date-time',
                            },
                            openingFuelStock: {
                              type: 'number',
                              example: 100,
                            },
                            closingFuelStock: { type: 'number', example: 40 },
                            fuelRefillQuantity: {
                              type: 'number',
                              example: 20,
                            },
                            fuelConsumed: { type: 'number', example: 80 },
                            hoursRun: { type: 'number', example: 6.5 },
                            expectedLitrePerHour: {
                              type: 'number',
                              example: 12.5,
                            },
                            actualLitrePerHour: {
                              type: 'number',
                              example: 12.3,
                            },
                            machineStartTime: {
                              type: 'string',
                              format: 'date-time',
                            },
                            machineEndTime: {
                              type: 'string',
                              format: 'date-time',
                            },
                            status: { type: 'string', example: 'ACTIVE' },
                            createdAt: {
                              type: 'string',
                              format: 'date-time',
                            },
                            updatedAt: {
                              type: 'string',
                              format: 'date-time',
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        ...errors,
      },
    },
  },
  '/api/domain/report/machine-summary/summary': {
    get: {
      tags: ['Reports'],
      summary: 'Get Machine Summary Dashboard Report',
      description:
        'Returns top machines by working hours, maintenance count, movement count, and upcoming maintenance schedules.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'query',
          name: 'projectId',
          required: false,
          schema: { type: 'string', format: 'uuid' },
          description: 'Filter dashboard by project ID',
        },
        {
          in: 'query',
          name: 'machineryId',
          required: false,
          schema: { type: 'string', format: 'uuid' },
          description: 'Filter dashboard for one machinery record',
        },
      ],
      responses: {
        200: {
          description: 'Report fetched successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'Report fetched successfully',
                  },
                  data: {
                    type: 'object',
                    properties: {
                      topWorkingHourMachines: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            machineCode: { type: 'string', example: 'MC-001' },
                            machineType: {
                              type: 'string',
                              example: 'Excavator',
                            },
                            projectCode: { type: 'string', example: 'PRJ001' },
                            projectName: {
                              type: 'string',
                              example: 'Bridge Construction',
                            },
                            totalWorkingHours: {
                              type: 'number',
                              example: 128.5,
                            },
                          },
                        },
                      },
                      topMaintenanceMachines: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            machineCode: { type: 'string', example: 'MC-001' },
                            machineType: {
                              type: 'string',
                              example: 'Excavator',
                            },
                            projectCode: { type: 'string', example: 'PRJ001' },
                            projectName: {
                              type: 'string',
                              example: 'Bridge Construction',
                            },
                            maintenanceCount: { type: 'integer', example: 5 },
                          },
                        },
                      },
                      topMovementMachines: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            machineCode: { type: 'string', example: 'MC-001' },
                            machineType: {
                              type: 'string',
                              example: 'Excavator',
                            },
                            projectCode: { type: 'string', example: 'PRJ001' },
                            projectName: {
                              type: 'string',
                              example: 'Bridge Construction',
                            },
                            movementCount: { type: 'integer', example: 8 },
                          },
                        },
                      },
                      upcomingSchedules: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            machineCode: { type: 'string', example: 'MC-001' },
                            machineType: {
                              type: 'string',
                              example: 'Excavator',
                            },
                            projectCode: { type: 'string', example: 'PRJ001' },
                            projectName: {
                              type: 'string',
                              example: 'Bridge Construction',
                            },
                            scheduleCode: {
                              type: 'string',
                              example: 'MS-001',
                            },
                            scheduleTitle: {
                              type: 'string',
                              example: 'Monthly Maintenance',
                            },
                            nextDueDate: {
                              type: 'string',
                              format: 'date-time',
                            },
                            scheduleStatus: {
                              type: 'string',
                              example: 'SCHEDULED',
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        ...errors,
      },
    },
  },
  '/api/domain/report/machine-summary/export': {
    get: {
      tags: ['Reports'],
      summary: 'Export Machine and Vehicle Summary Report',
      description:
        'Exports machine, machine reading, vehicle, maintenance schedule, maintenance log, and movement log worksheets as an Excel spreadsheet.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'query',
          name: 'export',
          required: true,
          schema: { type: 'string', enum: ['xlsx'] },
          description: 'Export format, must be xlsx',
        },
        {
          in: 'query',
          name: 'projectId',
          required: false,
          schema: { type: 'string', format: 'uuid' },
          description: 'Filter machine-related worksheets by project ID',
        },
        {
          in: 'query',
          name: 'machineryId',
          required: false,
          schema: { type: 'string', format: 'uuid' },
          description: 'Filter machine-related worksheets by machinery ID',
        },
        {
          in: 'query',
          name: 'vehicleId',
          required: false,
          schema: { type: 'string', format: 'uuid' },
          description: 'Filter vehicle-related worksheets by vehicle ID',
        },
      ],
      responses: {
        200: {
          description:
            'Excel file containing machine and vehicle summary worksheets',
          content: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
              {
                schema: { type: 'string', format: 'binary' },
              },
          },
        },
        ...errors,
      },
    },
  },
  '/api/domain/report/project-summary': {
    get: {
      tags: ['Reports'],
      summary: 'Get Project Summary Report',
      description:
        'Get project summary report, optionally filtered by country.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'query',
          name: 'country',
          required: false,
          schema: { type: 'string' },
          description: 'Filter projects by country name',
        },
      ],
      responses: {
        200: {
          description: 'Report fetched successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'Report fetched successfully',
                  },
                  data: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        projectCode: { type: 'string', example: 'PRJ001' },
                        projectName: {
                          type: 'string',
                          example: 'Bridge Construction',
                        },
                        projectType: {
                          type: 'string',
                          example: 'Infrastructure',
                        },
                        status: { type: 'string', example: 'ACTIVE' },
                        country: { type: 'string', example: 'India' },
                        totalStages: { type: 'integer', example: 5 },
                        totalTasks: { type: 'integer', example: 25 },
                        completedTasks: { type: 'integer', example: 10 },
                        delayedTasks: { type: 'integer', example: 2 },
                        totalRawMaterialRequests: {
                          type: 'integer',
                          example: 12,
                        },
                        totalInvoices: { type: 'integer', example: 8 },
                        totalInvoicedAmount: {
                          type: 'number',
                          example: 450000.5,
                        },
                        totalGrns: { type: 'integer', example: 6 },
                        totalGrnAmount: { type: 'number', example: 380000.0 },
                        totalPaymentRequests: { type: 'integer', example: 4 },
                        totalPaymentRequestAmount: {
                          type: 'number',
                          example: 200000.0,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        ...errors,
      },
    },
  },
  '/api/domain/report/project-summary/export': {
    get: {
      tags: ['Reports'],
      summary: 'Export Project Summary Report',
      description: 'Export project summary report as an Excel spreadsheet.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'query',
          name: 'export',
          required: true,
          schema: { type: 'string', enum: ['xlsx'] },
          description: 'Export format, must be xlsx',
        },
        {
          in: 'query',
          name: 'country',
          required: false,
          schema: { type: 'string' },
          description: 'Filter projects by country',
        },
        {
          in: 'query',
          name: 'projectId',
          required: false,
          schema: { type: 'string', format: 'uuid' },
          description: 'Filter by specific project ID',
        },
      ],
      responses: {
        200: {
          description: 'Excel file containing project summary report',
          content: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
              {
                schema: { type: 'string', format: 'binary' },
              },
          },
        },
        ...errors,
      },
    },
  },
  '/api/domain/report/project-user-task': {
    get: {
      tags: ['Reports'],
      summary: 'Get Project User Task Report',
      description: 'Get tasks assigned to users on specific projects.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'query',
          name: 'projectId',
          required: false,
          schema: { type: 'string', format: 'uuid' },
          description: 'Filter by project ID',
        },
        {
          in: 'query',
          name: 'userId',
          required: false,
          schema: { type: 'string', format: 'uuid' },
          description: 'Filter by user ID',
        },
      ],
      responses: {
        200: {
          description: 'Report fetched successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'Report fetched successfully',
                  },
                  data: {
                    type: 'object',
                    properties: {
                      analytics: {
                        type: 'object',
                        properties: {
                          totalAssignments: { type: 'integer', example: 15 },
                          totalHoursLogged: { type: 'number', example: 120.5 },
                          completedTasksCount: { type: 'integer', example: 8 },
                        },
                      },
                      assignments: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            projectName: {
                              type: 'string',
                              example: 'Bridge Construction',
                            },
                            userName: { type: 'string', example: 'John Doe' },
                            userEmail: {
                              type: 'string',
                              example: 'john@example.com',
                            },
                            role: { type: 'string', example: 'Engineer' },
                            assignedAt: { type: 'string', format: 'date-time' },
                            tasksCount: { type: 'integer', example: 4 },
                            completedTasksCount: {
                              type: 'integer',
                              example: 2,
                            },
                            delayedTasksCount: { type: 'integer', example: 0 },
                            totalHoursLogged: { type: 'number', example: 35.5 },
                            tasks: {
                              type: 'array',
                              items: {
                                type: 'object',
                                properties: {
                                  taskName: {
                                    type: 'string',
                                    example: 'Foundation Excavation',
                                  },
                                  stageName: {
                                    type: 'string',
                                    example: 'Phase 1',
                                  },
                                  status: {
                                    type: 'string',
                                    example: 'IN_PROGRESS',
                                  },
                                  startDate: { type: 'string', format: 'date' },
                                  endDate: { type: 'string', format: 'date' },
                                  delayDays: { type: 'integer', example: 0 },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        ...errors,
      },
    },
  },
  '/api/domain/report/project-user-task/export': {
    get: {
      tags: ['Reports'],
      summary: 'Export Project User Task Report',
      description: 'Export project user task report as an Excel spreadsheet.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'query',
          name: 'export',
          required: true,
          schema: { type: 'string', enum: ['xlsx'] },
          description: 'Export format, must be xlsx',
        },
        {
          in: 'query',
          name: 'projectId',
          required: false,
          schema: { type: 'string', format: 'uuid' },
          description: 'Filter by project ID',
        },
        {
          in: 'query',
          name: 'userId',
          required: false,
          schema: { type: 'string', format: 'uuid' },
          description: 'Filter by user ID',
        },
      ],
      responses: {
        200: {
          description: 'Excel file containing project user task report',
          content: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
              {
                schema: { type: 'string', format: 'binary' },
              },
          },
        },
        ...errors,
      },
    },
  },
  '/api/domain/report/product-inventory': {
    get: {
      tags: ['Reports'],
      summary: 'Get Product Inventory Report',
      description:
        'Get product inventory status, stock levels, and alert details.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'query',
          name: 'productId',
          required: false,
          schema: { type: 'string', format: 'uuid' },
          description: 'Filter by product ID',
        },
        {
          in: 'query',
          name: 'status',
          required: false,
          schema: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
          description: 'Filter by product status',
        },
      ],
      responses: {
        200: {
          description: 'Report fetched successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'Report fetched successfully',
                  },
                  data: {
                    type: 'object',
                    properties: {
                      analytics: {
                        type: 'object',
                        properties: {
                          totalProducts: { type: 'integer', example: 50 },
                          activeProducts: { type: 'integer', example: 45 },
                          lowStockProducts: { type: 'integer', example: 3 },
                        },
                      },
                      products: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            code: { type: 'string', example: 'PROD-CEM' },
                            displayName: {
                              type: 'string',
                              example: 'Cement Grade 53',
                            },
                            productType: {
                              type: 'string',
                              example: 'MATERIAL',
                            },
                            status: { type: 'string', example: 'ACTIVE' },
                            createdAt: { type: 'string', format: 'date-time' },
                            uoms: {
                              type: 'array',
                              items: {
                                type: 'object',
                                properties: {
                                  uomCode: { type: 'string', example: 'BAG' },
                                  uomName: {
                                    type: 'string',
                                    example: 'Bag (50kg)',
                                  },
                                  conversionRate: {
                                    type: 'number',
                                    example: 1,
                                  },
                                },
                              },
                            },
                            grades: {
                              type: 'array',
                              items: {
                                type: 'object',
                                properties: {
                                  code: { type: 'string', example: 'GR-A' },
                                  name: { type: 'string', example: 'Grade A' },
                                  stdRates: {
                                    type: 'array',
                                    items: {
                                      type: 'object',
                                      properties: {
                                        type: {
                                          type: 'string',
                                          example: 'STANDARD',
                                        },
                                        value: { type: 'number', example: 450 },
                                        alertThreshold: {
                                          type: 'number',
                                          example: 480,
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                            inventory: {
                              type: 'array',
                              items: {
                                type: 'object',
                                properties: {
                                  gradeCode: {
                                    type: 'string',
                                    example: 'GR-A',
                                  },
                                  gradeName: {
                                    type: 'string',
                                    example: 'Grade A',
                                  },
                                  quantity: { type: 'number', example: 120 },
                                  uomCode: { type: 'string', example: 'BAG' },
                                  reorderLevel: { type: 'number', example: 50 },
                                  lowStock: { type: 'boolean', example: false },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        ...errors,
      },
    },
  },
  '/api/domain/report/product-inventory/export': {
    get: {
      tags: ['Reports'],
      summary: 'Export Product Inventory Report',
      description:
        'Export product inventory status report as an Excel spreadsheet.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'query',
          name: 'export',
          required: true,
          schema: { type: 'string', enum: ['xlsx'] },
          description: 'Export format, must be xlsx',
        },
        {
          in: 'query',
          name: 'productId',
          required: false,
          schema: { type: 'string', format: 'uuid' },
          description: 'Filter by product ID',
        },
        {
          in: 'query',
          name: 'status',
          required: false,
          schema: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
          description: 'Filter by product status',
        },
      ],
      responses: {
        200: {
          description: 'Excel file containing product inventory report',
          content: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
              {
                schema: { type: 'string', format: 'binary' },
              },
          },
        },
        ...errors,
      },
    },
  },
  '/api/domain/report/vendor-purchase-history': {
    get: {
      tags: ['Reports'],
      summary: 'Get Vendor Purchase History Report',
      description:
        'Get details of invoices, GRNs, and amount summaries per vendor.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'query',
          name: 'vendorId',
          required: false,
          schema: { type: 'string', format: 'uuid' },
          description: 'Filter by vendor ID',
        },
        {
          in: 'query',
          name: 'projectId',
          required: false,
          schema: { type: 'string', format: 'uuid' },
          description: 'Filter by project ID',
        },
      ],
      responses: {
        200: {
          description: 'Report fetched successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'Report fetched successfully',
                  },
                  data: {
                    type: 'object',
                    properties: {
                      analytics: {
                        type: 'object',
                        properties: {
                          totalVendors: { type: 'integer', example: 12 },
                          totalInvoicedAmount: {
                            type: 'number',
                            example: 1250000.75,
                          },
                          totalGrnAmount: {
                            type: 'number',
                            example: 1120000.5,
                          },
                        },
                      },
                      vendors: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            vendorCode: { type: 'string', example: 'VND01' },
                            vendorName: {
                              type: 'string',
                              example: 'Apex Materials Corp',
                            },
                            vendorEmail: {
                              type: 'string',
                              example: 'sales@apex.com',
                            },
                            contactPerson: {
                              type: 'string',
                              example: 'Robert Smith',
                            },
                            phone: { type: 'string', example: '+1 555-0199' },
                            address: {
                              type: 'string',
                              example: '123 Industrial Parkway',
                            },
                            totalInvoices: { type: 'integer', example: 15 },
                            totalInvoicedAmount: {
                              type: 'number',
                              example: 450000,
                            },
                            totalGrns: { type: 'integer', example: 10 },
                            totalGrnAmount: { type: 'number', example: 380000 },
                            paymentStatusSummary: {
                              type: 'object',
                              properties: {
                                PENDING: {
                                  type: 'object',
                                  properties: {
                                    count: { type: 'integer', example: 2 },
                                    amount: { type: 'number', example: 50000 },
                                  },
                                },
                                PAID: {
                                  type: 'object',
                                  properties: {
                                    count: { type: 'integer', example: 13 },
                                    amount: { type: 'number', example: 400000 },
                                  },
                                },
                              },
                            },
                            invoices: {
                              type: 'array',
                              items: {
                                type: 'object',
                                properties: {
                                  invoiceCode: {
                                    type: 'string',
                                    example: 'INV-10023',
                                  },
                                  invoiceDate: {
                                    type: 'string',
                                    format: 'date-time',
                                  },
                                  dueDate: {
                                    type: 'string',
                                    format: 'date-time',
                                  },
                                  totalAmount: {
                                    type: 'number',
                                    example: 35000,
                                  },
                                  totalTax: { type: 'number', example: 3500 },
                                  paymentStatus: {
                                    type: 'string',
                                    example: 'PAID',
                                  },
                                  projectCode: {
                                    type: 'string',
                                    example: 'PRJ001',
                                  },
                                  projectName: {
                                    type: 'string',
                                    example: 'Bridge Construction',
                                  },
                                },
                              },
                            },
                            grns: {
                              type: 'array',
                              items: {
                                type: 'object',
                                properties: {
                                  grnCode: {
                                    type: 'string',
                                    example: 'GRN-552',
                                  },
                                  productOrderCode: {
                                    type: 'string',
                                    example: 'PO-991',
                                  },
                                  date: { type: 'string', format: 'date-time' },
                                  wbReference: {
                                    type: 'string',
                                    example: 'WB-772',
                                  },
                                  totalItems: { type: 'integer', example: 3 },
                                  totalAmount: {
                                    type: 'number',
                                    example: 30000,
                                  },
                                  projectCode: {
                                    type: 'string',
                                    example: 'PRJ001',
                                  },
                                  projectName: {
                                    type: 'string',
                                    example: 'Bridge Construction',
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        ...errors,
      },
    },
  },
  '/api/domain/report/vendor-purchase-history/export': {
    get: {
      tags: ['Reports'],
      summary: 'Export Vendor Purchase History Report',
      description:
        'Export vendor purchase history report as an Excel spreadsheet.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'query',
          name: 'export',
          required: true,
          schema: { type: 'string', enum: ['xlsx'] },
          description: 'Export format, must be xlsx',
        },
        {
          in: 'query',
          name: 'vendorId',
          required: false,
          schema: { type: 'string', format: 'uuid' },
          description: 'Filter by vendor ID',
        },
        {
          in: 'query',
          name: 'projectId',
          required: false,
          schema: { type: 'string', format: 'uuid' },
          description: 'Filter by project ID',
        },
      ],
      responses: {
        200: {
          description: 'Excel file containing vendor purchase history report',
          content: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
              {
                schema: { type: 'string', format: 'binary' },
              },
          },
        },
        ...errors,
      },
    },
  },
  '/api/domain/report/product-transaction-history': {
    get: {
      tags: ['Reports'],
      summary: 'Get Product Transaction History Report',
      description:
        'Get product transactions (requisitions, invoices, receipts/GRNs) over a timeline.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'query',
          name: 'productId',
          required: false,
          schema: { type: 'string', format: 'uuid' },
          description: 'Filter by product ID',
        },
        {
          in: 'query',
          name: 'projectId',
          required: false,
          schema: { type: 'string', format: 'uuid' },
          description: 'Filter by project ID',
        },
        {
          in: 'query',
          name: 'startDate',
          required: false,
          schema: { type: 'string', format: 'date-time' },
          description: 'Timeline start date (inclusive)',
        },
        {
          in: 'query',
          name: 'endDate',
          required: false,
          schema: { type: 'string', format: 'date-time' },
          description: 'Timeline end date (inclusive)',
        },
      ],
      responses: {
        200: {
          description: 'Report fetched successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'Report fetched successfully',
                  },
                  data: {
                    type: 'object',
                    properties: {
                      transactions: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            date: { type: 'string', format: 'date-time' },
                            type: { type: 'string', example: 'Receipt (GRN)' },
                            code: { type: 'string', example: 'GRN-552' },
                            productCode: {
                              type: 'string',
                              example: 'PROD-CEM',
                            },
                            productName: {
                              type: 'string',
                              example: 'Cement Grade 53',
                            },
                            gradeCode: { type: 'string', example: 'GR-A' },
                            gradeName: { type: 'string', example: 'Grade A' },
                            quantity: { type: 'number', example: 100 },
                            uom: { type: 'string', example: 'BAG' },
                            unitRate: { type: 'number', example: 450 },
                            totalAmount: { type: 'number', example: 45000 },
                            projectCode: { type: 'string', example: 'PRJ001' },
                            projectName: {
                              type: 'string',
                              example: 'Bridge Construction',
                            },
                            reference: {
                              type: 'string',
                              example: 'Apex Materials Corp',
                            },
                            status: { type: 'string', example: 'APPROVED' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        ...errors,
      },
    },
  },
  '/api/domain/report/product-transaction-history/export': {
    get: {
      tags: ['Reports'],
      summary: 'Export Product Transaction History Report',
      description:
        'Export product transaction history report as an Excel spreadsheet.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'query',
          name: 'export',
          required: true,
          schema: { type: 'string', enum: ['xlsx'] },
          description: 'Export format, must be xlsx',
        },
        {
          in: 'query',
          name: 'productId',
          required: false,
          schema: { type: 'string', format: 'uuid' },
          description: 'Filter by product ID',
        },
        {
          in: 'query',
          name: 'projectId',
          required: false,
          schema: { type: 'string', format: 'uuid' },
          description: 'Filter by project ID',
        },
        {
          in: 'query',
          name: 'startDate',
          required: false,
          schema: { type: 'string', format: 'date-time' },
          description: 'Timeline start date',
        },
        {
          in: 'query',
          name: 'endDate',
          required: false,
          schema: { type: 'string', format: 'date-time' },
          description: 'Timeline end date',
        },
      ],
      responses: {
        200: {
          description:
            'Excel file containing product transaction history report',
          content: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
              {
                schema: { type: 'string', format: 'binary' },
              },
          },
        },
        ...errors,
      },
    },
  },
  '/api/admin/report/domains': {
    get: {
      tags: ['Admin Reports'],
      summary: 'List Accessible Domains',
      description: 'Returns a list of domains accessible by the logged-in administrator.',
      security: [{ bearerAuth: [] }],
      parameters: [...adminDomainScopeParams],
      responses: {
        200: {
          description: 'Domains fetched successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Domains fetched successfully' },
                  data: {
                    type: 'array',
                    items: domainRefSchema,
                  },
                },
              },
            },
          },
        },
        ...errors,
      },
    },
  },
  '/api/admin/report/project-summary': {
    get: {
      tags: ['Admin Reports'],
      summary: 'Get Project Summary Report (Admin)',
      description: 'Returns project summary report for accessible domains, optionally filtered by country.',
      security: [{ bearerAuth: [] }],
      parameters: [
        ...adminDomainScopeParams,
        {
          in: 'query',
          name: 'country',
          required: false,
          schema: { type: 'string' },
          description: 'Filter projects by country name',
        },
      ],
      responses: {
        200: {
          description: 'Report fetched successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Report fetched successfully' },
                  data: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        domain: domainRefSchema,
                        analytics: {
                          type: 'object',
                          properties: {
                            projectCount: { type: 'integer', example: 5 },
                            budget: { type: 'number', example: 1000000.0 },
                            spent: { type: 'number', example: 450000.5 },
                            utilization: { type: 'number', example: 45.0 },
                            projects: {
                              type: 'array',
                              items: {
                                type: 'object',
                                properties: {
                                  project: { type: 'string', example: 'Bridge Construction' },
                                  country: { type: 'string', example: 'India' },
                                  budget: { type: 'number', example: 500000.0 },
                                  spent: { type: 'number', example: 200000.0 },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        ...errors,
      },
    },
  },
  '/api/admin/report/project-summary/export': {
    get: {
      tags: ['Admin Reports'],
      summary: 'Export Project Summary Report (Admin)',
      description: 'Exports project summary report as an Excel spreadsheet.',
      security: [{ bearerAuth: [] }],
      parameters: [
        ...adminDomainScopeParams,
        {
          in: 'query',
          name: 'country',
          required: false,
          schema: { type: 'string' },
          description: 'Filter projects by country',
        },
        {
          in: 'query',
          name: 'projectId',
          required: false,
          schema: { type: 'string', format: 'uuid' },
          description: 'Filter by specific project ID',
        },
        {
          in: 'query',
          name: 'export',
          required: true,
          schema: { type: 'string', enum: ['xlsx'] },
          description: 'Export format, must be xlsx',
        },
      ],
      responses: {
        200: {
          description: 'Excel file containing project summary report',
          content: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
              schema: { type: 'string', format: 'binary' },
            },
          },
        },
        ...errors,
      },
    },
  },
  '/api/admin/report/project-user-task': {
    get: {
      tags: ['Admin Reports'],
      summary: 'Get Project User Task Report (Admin)',
      description: 'Returns tasks assigned to users on specific projects across accessible domains.',
      security: [{ bearerAuth: [] }],
      parameters: [
        ...adminDomainScopeParams,
        {
          in: 'query',
          name: 'projectId',
          required: false,
          schema: { type: 'string', format: 'uuid' },
          description: 'Filter by project ID',
        },
        {
          in: 'query',
          name: 'userId',
          required: false,
          schema: { type: 'string', format: 'uuid' },
          description: 'Filter by user ID',
        },
      ],
      responses: {
        200: {
          description: 'Report fetched successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Report fetched successfully' },
                  data: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        domain: domainRefSchema,
                        projectUsers: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              projectCode: { type: 'string', example: 'PRJ001' },
                              projectName: { type: 'string', example: 'Bridge Construction' },
                              userName: { type: 'string', example: 'John Doe' },
                              userEmail: { type: 'string', example: 'john@example.com' },
                              startDate: { type: 'string', format: 'date-time' },
                              endDate: { type: 'string', format: 'date-time' },
                              dailyWorkingHours: { type: 'number', example: 8 },
                              dayCharge: { type: 'number', example: 250 },
                              notes: { type: 'string', example: 'Assigned to Phase 1' },
                              status: { type: 'string', example: 'ACTIVE' },
                              createdAt: { type: 'string', format: 'date-time' },
                              updatedAt: { type: 'string', format: 'date-time' },
                            },
                          },
                        },
                        userTasks: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              projectCode: { type: 'string', example: 'PRJ001' },
                              projectName: { type: 'string', example: 'Bridge Construction' },
                              stageCode: { type: 'string', example: 'STG001' },
                              stageName: { type: 'string', example: 'Foundation' },
                              taskCode: { type: 'string', example: 'TSK001' },
                              taskName: { type: 'string', example: 'Excavation' },
                              userName: { type: 'string', example: 'John Doe' },
                              userEmail: { type: 'string', example: 'john@example.com' },
                              taskStatus: { type: 'string', example: 'IN_PROGRESS' },
                              taskProgress: { type: 'number', example: 45 },
                              requiredApproval: { type: 'boolean', example: false },
                              approvalState: { type: 'string', example: 'APPROVED' },
                              plannedStartDate: { type: 'string', format: 'date-time' },
                              plannedEndDate: { type: 'string', format: 'date-time' },
                              actualStartDate: { type: 'string', format: 'date-time' },
                              actualEndDate: { type: 'string', format: 'date-time' },
                              status: { type: 'string', example: 'ACTIVE' },
                              createdAt: { type: 'string', format: 'date-time' },
                              updatedAt: { type: 'string', format: 'date-time' },
                            },
                          },
                        },
                        projectTaskDelays: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              projectCode: { type: 'string', example: 'PRJ001' },
                              projectName: { type: 'string', example: 'Bridge Construction' },
                              stageCode: { type: 'string', example: 'STG001' },
                              stageName: { type: 'string', example: 'Foundation' },
                              taskCode: { type: 'string', example: 'TSK001' },
                              taskName: { type: 'string', example: 'Excavation' },
                              userName: { type: 'string', example: 'John Doe' },
                              userEmail: { type: 'string', example: 'john@example.com' },
                              delayReason: { type: 'string', example: 'Weather conditions' },
                              delayDays: { type: 'integer', example: 3 },
                              taskProgress: { type: 'number', example: 45 },
                              totalDelayInDays: { type: 'integer', example: 5 },
                              approvalStatus: { type: 'string', example: 'APPROVED' },
                              approvalTime: { type: 'string', format: 'date-time' },
                              status: { type: 'string', example: 'ACTIVE' },
                              createdAt: { type: 'string', format: 'date-time' },
                              updatedAt: { type: 'string', format: 'date-time' },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        ...errors,
      },
    },
  },
  '/api/admin/report/project-user-task/export': {
    get: {
      tags: ['Admin Reports'],
      summary: 'Export Project User Task Report (Admin)',
      description: 'Exports project user task report as an Excel spreadsheet.',
      security: [{ bearerAuth: [] }],
      parameters: [
        ...adminDomainScopeParams,
        {
          in: 'query',
          name: 'projectId',
          required: false,
          schema: { type: 'string', format: 'uuid' },
          description: 'Filter by project ID',
        },
        {
          in: 'query',
          name: 'userId',
          required: false,
          schema: { type: 'string', format: 'uuid' },
          description: 'Filter by user ID',
        },
        {
          in: 'query',
          name: 'export',
          required: true,
          schema: { type: 'string', enum: ['xlsx'] },
          description: 'Export format, must be xlsx',
        },
      ],
      responses: {
        200: {
          description: 'Excel file containing project user task report',
          content: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
              schema: { type: 'string', format: 'binary' },
            },
          },
        },
        ...errors,
      },
    },
  },
  '/api/admin/report/project-user-task/summary': {
    get: {
      tags: ['Admin Reports'],
      summary: 'Get Project User Task Summary (Admin)',
      description: 'Returns high-level analytics for project user tasks, including low progress tasks, top users, and delays.',
      security: [{ bearerAuth: [] }],
      parameters: [
        ...adminDomainScopeParams,
        {
          in: 'query',
          name: 'projectId',
          required: false,
          schema: { type: 'string', format: 'uuid' },
          description: 'Filter by project ID',
        },
        {
          in: 'query',
          name: 'userId',
          required: false,
          schema: { type: 'string', format: 'uuid' },
          description: 'Filter by user ID',
        },
      ],
      responses: {
        200: {
          description: 'Report fetched successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Report fetched successfully' },
                  data: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        domain: domainRefSchema,
                        lowProgressTasks: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              projectCode: { type: 'string', example: 'PRJ001' },
                              projectName: { type: 'string', example: 'Bridge Construction' },
                              taskCode: { type: 'string', example: 'TSK001' },
                              taskName: { type: 'string', example: 'Excavation' },
                              userName: { type: 'string', example: 'John Doe' },
                              taskProgress: { type: 'number', example: 5 },
                            },
                          },
                        },
                        topTaskUsers: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              userName: { type: 'string', example: 'John Doe' },
                              userEmail: { type: 'string', example: 'john@example.com' },
                              taskCount: { type: 'integer', example: 10 },
                            },
                          },
                        },
                        topProjectUsers: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              userName: { type: 'string', example: 'John Doe' },
                              userEmail: { type: 'string', example: 'john@example.com' },
                              projectCount: { type: 'integer', example: 3 },
                            },
                          },
                        },
                        topTaskDelays: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              projectCode: { type: 'string', example: 'PRJ001' },
                              taskCode: { type: 'string', example: 'TSK001' },
                              taskName: { type: 'string', example: 'Excavation' },
                              totalDelayInDays: { type: 'integer', example: 15 },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        ...errors,
      },
    },
  },
  '/api/admin/report/machine-summary': {
    get: {
      tags: ['Admin Reports'],
      summary: 'Get Machine Summary Report (Admin)',
      description: 'Returns list of machines and readings across accessible domains.',
      security: [{ bearerAuth: [] }],
      parameters: [
        ...adminDomainScopeParams,
        {
          in: 'query',
          name: 'projectId',
          required: false,
          schema: { type: 'string', format: 'uuid' },
          description: 'Filter by project ID',
        },
        {
          in: 'query',
          name: 'machineryId',
          required: false,
          schema: { type: 'string', format: 'uuid' },
          description: 'Filter report for one machinery record',
        },
      ],
      responses: {
        200: {
          description: 'Report fetched successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Report fetched successfully' },
                  data: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        domain: domainRefSchema,
                        machines: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              projectCode: { type: 'string', example: 'PRJ001' },
                              projectName: { type: 'string', example: 'Bridge Construction' },
                              machineCode: { type: 'string', example: 'MC-001' },
                              machineType: { type: 'string', example: 'Excavator' },
                              expectedLitrePerHour: { type: 'number', example: 12.5 },
                              status: { type: 'string', example: 'ACTIVE' },
                              createdAt: { type: 'string', format: 'date-time' },
                              updatedAt: { type: 'string', format: 'date-time' },
                            },
                          },
                        },
                        machineReadings: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              projectCode: { type: 'string', example: 'PRJ001' },
                              projectName: { type: 'string', example: 'Bridge Construction' },
                              machineCode: { type: 'string', example: 'MC-001' },
                              machineType: { type: 'string', example: 'Excavator' },
                              readingCode: { type: 'string', example: 'MR-001' },
                              readingDate: { type: 'string', format: 'date-time' },
                              openingFuelStock: { type: 'number', example: 100 },
                              closingFuelStock: { type: 'number', example: 40 },
                              fuelRefillQuantity: { type: 'number', example: 20 },
                              fuelConsumed: { type: 'number', example: 80 },
                              hoursRun: { type: 'number', example: 6.5 },
                              expectedLitrePerHour: { type: 'number', example: 12.5 },
                              actualLitrePerHour: { type: 'number', example: 12.3 },
                              machineStartTime: { type: 'string', format: 'date-time' },
                              machineEndTime: { type: 'string', format: 'date-time' },
                              status: { type: 'string', example: 'ACTIVE' },
                              createdAt: { type: 'string', format: 'date-time' },
                              updatedAt: { type: 'string', format: 'date-time' },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        ...errors,
      },
    },
  },
  '/api/admin/report/machine-summary/summary': {
    get: {
      tags: ['Admin Reports'],
      summary: 'Get Machine Summary Dashboard (Admin)',
      description: 'Returns aggregated metrics for machines (working hours, maintenance logs, and movement logs).',
      security: [{ bearerAuth: [] }],
      parameters: [
        ...adminDomainScopeParams,
        {
          in: 'query',
          name: 'projectId',
          required: false,
          schema: { type: 'string', format: 'uuid' },
          description: 'Filter dashboard by project ID',
        },
        {
          in: 'query',
          name: 'machineryId',
          required: false,
          schema: { type: 'string', format: 'uuid' },
          description: 'Filter dashboard for one machinery record',
        },
      ],
      responses: {
        200: {
          description: 'Report fetched successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Report fetched successfully' },
                  data: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        domain: domainRefSchema,
                        topWorkingHourMachines: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              machineCode: { type: 'string', example: 'MC-001' },
                              machineType: { type: 'string', example: 'Excavator' },
                              projectCode: { type: 'string', example: 'PRJ001' },
                              projectName: { type: 'string', example: 'Bridge Construction' },
                              totalWorkingHours: { type: 'number', example: 128.5 },
                            },
                          },
                        },
                        topMaintenanceMachines: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              machineCode: { type: 'string', example: 'MC-001' },
                              machineType: { type: 'string', example: 'Excavator' },
                              projectCode: { type: 'string', example: 'PRJ001' },
                              projectName: { type: 'string', example: 'Bridge Construction' },
                              maintenanceCount: { type: 'integer', example: 5 },
                            },
                          },
                        },
                        topMovementMachines: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              machineCode: { type: 'string', example: 'MC-001' },
                              machineType: { type: 'string', example: 'Excavator' },
                              projectCode: { type: 'string', example: 'PRJ001' },
                              projectName: { type: 'string', example: 'Bridge Construction' },
                              movementCount: { type: 'integer', example: 8 },
                            },
                          },
                        },
                        upcomingSchedules: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              machineCode: { type: 'string', example: 'MC-001' },
                              machineType: { type: 'string', example: 'Excavator' },
                              projectCode: { type: 'string', example: 'PRJ001' },
                              projectName: { type: 'string', example: 'Bridge Construction' },
                              scheduleCode: { type: 'string', example: 'MS-001' },
                              scheduleTitle: { type: 'string', example: 'Monthly Maintenance' },
                              nextDueDate: { type: 'string', format: 'date-time' },
                              scheduleStatus: { type: 'string', example: 'SCHEDULED' },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        ...errors,
      },
    },
  },
  '/api/admin/report/machine-summary/export': {
    get: {
      tags: ['Admin Reports'],
      summary: 'Export Machine and Vehicle Summary (Admin)',
      description: 'Exports machine, vehicle, logs, and schedules worksheet as an Excel spreadsheet.',
      security: [{ bearerAuth: [] }],
      parameters: [
        ...adminDomainScopeParams,
        {
          in: 'query',
          name: 'projectId',
          required: false,
          schema: { type: 'string', format: 'uuid' },
          description: 'Filter by project ID',
        },
        {
          in: 'query',
          name: 'machineryId',
          required: false,
          schema: { type: 'string', format: 'uuid' },
          description: 'Filter by machinery ID',
        },
        {
          in: 'query',
          name: 'vehicleId',
          required: false,
          schema: { type: 'string', format: 'uuid' },
          description: 'Filter by vehicle ID',
        },
        {
          in: 'query',
          name: 'export',
          required: true,
          schema: { type: 'string', enum: ['xlsx'] },
          description: 'Export format, must be xlsx',
        },
      ],
      responses: {
        200: {
          description: 'Excel file containing machine and vehicle summary sheets',
          content: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
              schema: { type: 'string', format: 'binary' },
            },
          },
        },
        ...errors,
      },
    },
  },
  '/api/admin/report/product-inventory': {
    get: {
      tags: ['Admin Reports'],
      summary: 'Get Product Inventory Report (Admin)',
      description: 'Returns product inventory data, standard rates, stock levels, and alert details.',
      security: [{ bearerAuth: [] }],
      parameters: [
        ...adminDomainScopeParams,
        {
          in: 'query',
          name: 'productId',
          required: false,
          schema: { type: 'string', format: 'uuid' },
          description: 'Filter by product ID',
        },
        {
          in: 'query',
          name: 'status',
          required: false,
          schema: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
          description: 'Filter by product status',
        },
      ],
      responses: {
        200: {
          description: 'Report fetched successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Report fetched successfully' },
                  data: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        domain: domainRefSchema,
                        analytics: {
                          type: 'object',
                          properties: {
                            totalProducts: { type: 'integer', example: 50 },
                            totalInventoryQuantity: { type: 'number', example: 5000 },
                            totalInventoryValue: { type: 'number', example: 2250000 },
                            lowStockCount: { type: 'integer', example: 3 },
                            outOfStockCount: { type: 'integer', example: 1 },
                            lowStock: {
                              type: 'array',
                              items: {
                                type: 'object',
                                properties: {
                                  productCode: { type: 'string', example: 'PROD-CEM' },
                                  productName: { type: 'string', example: 'Cement Grade 53' },
                                  gradeCode: { type: 'string', example: 'GR-A' },
                                  gradeName: { type: 'string', example: 'Grade A' },
                                  quantity: { type: 'number', example: 12 },
                                  reorderLevel: { type: 'number', example: 50 },
                                  uomCode: { type: 'string', example: 'BAG' },
                                },
                              },
                            },
                            outOfStock: {
                              type: 'array',
                              items: {
                                type: 'object',
                                properties: {
                                  productCode: { type: 'string', example: 'PROD-STEEL' },
                                  productName: { type: 'string', example: 'Steel TMT 12mm' },
                                  gradeCode: { type: 'string', example: 'GR-B' },
                                  gradeName: { type: 'string', example: 'Grade B' },
                                  uomCode: { type: 'string', example: 'TONNE' },
                                  reorderLevel: { type: 'number', example: 10 },
                                },
                              },
                            },
                          },
                        },
                        products: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              id: { type: 'string', format: 'uuid', example: 'a2430489-0b1e-450f-a42e-834928420993' },
                              code: { type: 'string', example: 'PROD-CEM' },
                              displayName: { type: 'string', example: 'Cement Grade 53' },
                              productType: { type: 'string', example: 'MATERIAL' },
                              status: { type: 'string', example: 'ACTIVE' },
                              createdAt: { type: 'string', format: 'date-time' },
                              updatedAt: { type: 'string', format: 'date-time' },
                              uoms: {
                                type: 'array',
                                items: {
                                  type: 'object',
                                  properties: {
                                    code: { type: 'string', example: 'BAG' },
                                    name: { type: 'string', example: 'Bag (50kg)' },
                                    conversionRate: { type: 'number', example: 1 },
                                    baseUomName: { type: 'string', example: 'Bag' },
                                  },
                                },
                              },
                              grades: {
                                type: 'array',
                                items: {
                                  type: 'object',
                                  properties: {
                                    code: { type: 'string', example: 'GR-A' },
                                    name: { type: 'string', example: 'Grade A' },
                                    stdRates: {
                                      type: 'array',
                                      items: {
                                        type: 'object',
                                        properties: {
                                          type: { type: 'string', example: 'STANDARD' },
                                          value: { type: 'number', example: 450 },
                                          alertThreshold: { type: 'number', example: 480 },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                              inventory: {
                                type: 'array',
                                items: {
                                  type: 'object',
                                  properties: {
                                    gradeCode: { type: 'string', example: 'GR-A' },
                                    gradeName: { type: 'string', example: 'Grade A' },
                                    quantity: { type: 'number', example: 120 },
                                    uomCode: { type: 'string', example: 'BAG' },
                                    reorderLevel: { type: 'number', example: 50 },
                                    lowStock: { type: 'boolean', example: false },
                                  },
                                },
                              },
                              totalQuantity: { type: 'number', example: 120 },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        ...errors,
      },
    },
  },
  '/api/admin/report/product-inventory/export': {
    get: {
      tags: ['Admin Reports'],
      summary: 'Export Product Inventory Report (Admin)',
      description: 'Exports product inventory data report as an Excel spreadsheet.',
      security: [{ bearerAuth: [] }],
      parameters: [
        ...adminDomainScopeParams,
        {
          in: 'query',
          name: 'productId',
          required: false,
          schema: { type: 'string', format: 'uuid' },
          description: 'Filter by product ID',
        },
        {
          in: 'query',
          name: 'status',
          required: false,
          schema: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
          description: 'Filter by product status',
        },
        {
          in: 'query',
          name: 'export',
          required: true,
          schema: { type: 'string', enum: ['xlsx'] },
          description: 'Export format, must be xlsx',
        },
      ],
      responses: {
        200: {
          description: 'Excel file containing product inventory report',
          content: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
              schema: { type: 'string', format: 'binary' },
            },
          },
        },
        ...errors,
      },
    },
  },
  '/api/admin/report/vendor-purchase-history': {
    get: {
      tags: ['Admin Reports'],
      summary: 'Get Vendor Purchase History (Admin)',
      description: 'Returns details of invoices, GRNs, and amount summaries per vendor across domains.',
      security: [{ bearerAuth: [] }],
      parameters: [
        ...adminDomainScopeParams,
        {
          in: 'query',
          name: 'vendorId',
          required: false,
          schema: { type: 'string', format: 'uuid' },
          description: 'Filter by vendor ID',
        },
        {
          in: 'query',
          name: 'projectId',
          required: false,
          schema: { type: 'string', format: 'uuid' },
          description: 'Filter by project ID',
        },
      ],
      responses: {
        200: {
          description: 'Report fetched successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Report fetched successfully' },
                  data: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        domain: domainRefSchema,
                        analytics: {
                          type: 'object',
                          properties: {
                            totalVendors: { type: 'integer', example: 12 },
                            totalInvoicedAmount: { type: 'number', example: 1250000.75 },
                            totalGrnAmount: { type: 'number', example: 1120000.5 },
                          },
                        },
                        vendors: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              vendorCode: { type: 'string', example: 'VND01' },
                              vendorName: { type: 'string', example: 'Apex Materials Corp' },
                              vendorEmail: { type: 'string', example: 'sales@apex.com' },
                              contactPerson: { type: 'string', example: 'Robert Smith' },
                              phone: { type: 'string', example: '+1 555-0199' },
                              address: { type: 'string', example: '123 Industrial Parkway' },
                              totalInvoices: { type: 'integer', example: 15 },
                              totalInvoicedAmount: { type: 'number', example: 450000 },
                              totalGrns: { type: 'integer', example: 10 },
                              totalGrnAmount: { type: 'number', example: 380000 },
                              paymentStatusSummary: {
                                type: 'object',
                                properties: {
                                  PENDING: {
                                    type: 'object',
                                    properties: {
                                      count: { type: 'integer', example: 2 },
                                      amount: { type: 'number', example: 50000 },
                                    },
                                  },
                                  PAID: {
                                    type: 'object',
                                    properties: {
                                      count: { type: 'integer', example: 13 },
                                      amount: { type: 'number', example: 400000 },
                                    },
                                  },
                                },
                              },
                              invoices: {
                                type: 'array',
                                items: {
                                  type: 'object',
                                  properties: {
                                    invoiceCode: { type: 'string', example: 'INV-10023' },
                                    invoiceDate: { type: 'string', format: 'date-time' },
                                    dueDate: { type: 'string', format: 'date-time' },
                                    totalAmount: { type: 'number', example: 35000 },
                                    totalTax: { type: 'number', example: 3500 },
                                    paymentStatus: { type: 'string', example: 'PAID' },
                                    projectCode: { type: 'string', example: 'PRJ001' },
                                    projectName: { type: 'string', example: 'Bridge Construction' },
                                  },
                                },
                              },
                              grns: {
                                type: 'array',
                                items: {
                                  type: 'object',
                                  properties: {
                                    grnCode: { type: 'string', example: 'GRN-552' },
                                    productOrderCode: { type: 'string', example: 'PO-991' },
                                    date: { type: 'string', format: 'date-time' },
                                    wbReference: { type: 'string', example: 'WB-772' },
                                    totalItems: { type: 'integer', example: 3 },
                                    totalAmount: { type: 'number', example: 30000 },
                                    projectCode: { type: 'string', example: 'PRJ001' },
                                    projectName: { type: 'string', example: 'Bridge Construction' },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        ...errors,
      },
    },
  },
  '/api/admin/report/vendor-purchase-history/export': {
    get: {
      tags: ['Admin Reports'],
      summary: 'Export Vendor Purchase History (Admin)',
      description: 'Exports vendor purchase history report as an Excel spreadsheet.',
      security: [{ bearerAuth: [] }],
      parameters: [
        ...adminDomainScopeParams,
        {
          in: 'query',
          name: 'vendorId',
          required: false,
          schema: { type: 'string', format: 'uuid' },
          description: 'Filter by vendor ID',
        },
        {
          in: 'query',
          name: 'projectId',
          required: false,
          schema: { type: 'string', format: 'uuid' },
          description: 'Filter by project ID',
        },
        {
          in: 'query',
          name: 'export',
          required: true,
          schema: { type: 'string', enum: ['xlsx'] },
          description: 'Export format, must be xlsx',
        },
      ],
      responses: {
        200: {
          description: 'Excel file containing vendor purchase history report',
          content: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
              schema: { type: 'string', format: 'binary' },
            },
          },
        },
        ...errors,
      },
    },
  },
  '/api/admin/report/product-transaction-history': {
    get: {
      tags: ['Admin Reports'],
      summary: 'Get Product Transaction History (Admin)',
      description: 'Returns product transactions (requisitions, invoices, receipts/GRNs) over a timeline.',
      security: [{ bearerAuth: [] }],
      parameters: [
        ...adminDomainScopeParams,
        {
          in: 'query',
          name: 'productId',
          required: false,
          schema: { type: 'string', format: 'uuid' },
          description: 'Filter by product ID',
        },
        {
          in: 'query',
          name: 'projectId',
          required: false,
          schema: { type: 'string', format: 'uuid' },
          description: 'Filter by project ID',
        },
        {
          in: 'query',
          name: 'startDate',
          required: false,
          schema: { type: 'string', format: 'date-time' },
          description: 'Timeline start date (inclusive)',
        },
        {
          in: 'query',
          name: 'endDate',
          required: false,
          schema: { type: 'string', format: 'date-time' },
          description: 'Timeline end date (inclusive)',
        },
      ],
      responses: {
        200: {
          description: 'Report fetched successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Report fetched successfully' },
                  data: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        domain: domainRefSchema,
                        transactions: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              date: { type: 'string', format: 'date-time' },
                              type: { type: 'string', example: 'Receipt (GRN)' },
                              code: { type: 'string', example: 'GRN-552' },
                              productCode: { type: 'string', example: 'PROD-CEM' },
                              productName: { type: 'string', example: 'Cement Grade 53' },
                              gradeCode: { type: 'string', example: 'GR-A' },
                              gradeName: { type: 'string', example: 'Grade A' },
                              quantity: { type: 'number', example: 100 },
                              uom: { type: 'string', example: 'BAG' },
                              unitRate: { type: 'number', example: 450 },
                              totalAmount: { type: 'number', example: 45000 },
                              projectCode: { type: 'string', example: 'PRJ001' },
                              projectName: { type: 'string', example: 'Bridge Construction' },
                              reference: { type: 'string', example: 'Apex Materials Corp' },
                              status: { type: 'string', example: 'APPROVED' },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        ...errors,
      },
    },
  },
  '/api/admin/report/product-transaction-history/export': {
    get: {
      tags: ['Admin Reports'],
      summary: 'Export Product Transaction History (Admin)',
      description: 'Exports product transaction history report as an Excel spreadsheet.',
      security: [{ bearerAuth: [] }],
      parameters: [
        ...adminDomainScopeParams,
        {
          in: 'query',
          name: 'productId',
          required: false,
          schema: { type: 'string', format: 'uuid' },
          description: 'Filter by product ID',
        },
        {
          in: 'query',
          name: 'projectId',
          required: false,
          schema: { type: 'string', format: 'uuid' },
          description: 'Filter by project ID',
        },
        {
          in: 'query',
          name: 'startDate',
          required: false,
          schema: { type: 'string', format: 'date-time' },
          description: 'Timeline start date',
        },
        {
          in: 'query',
          name: 'endDate',
          required: false,
          schema: { type: 'string', format: 'date-time' },
          description: 'Timeline end date',
        },
        {
          in: 'query',
          name: 'export',
          required: true,
          schema: { type: 'string', enum: ['xlsx'] },
          description: 'Export format, must be xlsx',
        },
      ],
      responses: {
        200: {
          description: 'Excel file containing product transaction history report',
          content: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
              schema: { type: 'string', format: 'binary' },
            },
          },
        },
        ...errors,
      },
    },
  },
};
