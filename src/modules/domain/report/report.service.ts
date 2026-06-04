import { StatusEnum } from '@constants/index';
import prisma from '@/infra/database/prisma/prisma.client';
import { normalizePrismaError } from '@/utils/prismaError';
import { isPlainObject } from '@/utils/validation';

type SummaryProject = {
  project: string;
  country: string;
  budget: number;
  spent: number;
};

export type SummaryExportProject = SummaryProject & {
  id: string;
  code: string;
  status: string;
  utilization: number;
  expectedStartDate: Date | null;
  expectedEndDate: Date | null;
  actualStartDate: Date | null;
  actualEndDate: Date | null;
};

type ReportWorkbookCell = string | number | boolean | Date | null;

export interface ReportWorkbookWorksheet {
  name: string;
  columns: string[];
  rows: Record<string, ReportWorkbookCell>[];
}

type SummaryAnalytics = {
  projectCount: number;
  budget: number;
  spent: number;
  utilization: number;
  projects: SummaryProject[];
};

function toNumber(value: unknown): number {
  if (typeof value === 'number') {
    return value;
  }

  if (value === null || value === undefined) {
    return 0;
  }

  return Number(value);
}

function roundToTwo(value: number): number {
  return Math.round(value * 100) / 100;
}

function getLocalizedText(value: unknown, language: string | null): string {
  if (!isPlainObject(value)) {
    return value === null || value === undefined ? '' : String(value);
  }

  const langCode = language || 'en';
  const localizedValue = value[langCode] ?? value.en ?? '';

  return typeof localizedValue === 'string'
    ? localizedValue
    : String(localizedValue);
}

function normalizeDescription(value: unknown, language: string | null): string {
  if (value === null || value === undefined) return '';

  if (isPlainObject(value)) {
    return getLocalizedText(value, language);
  }

  if (typeof value !== 'string') {
    return String(value);
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    return isPlainObject(parsed) ? getLocalizedText(parsed, language) : value;
  } catch {
    return value;
  }
}

function normalizeCountry(country?: string): string | undefined {
  const value = country?.trim();

  if (!value || value.toLowerCase() === 'all') {
    return undefined;
  }

  return value;
}

function worksheet(
  name: string,
  columns: string[],
  rows: Record<string, ReportWorkbookCell>[],
): ReportWorkbookWorksheet {
  return { name, columns, rows };
}

async function getSummaryReport(
  domainId: string,
  country: string | undefined,
  language: string | null,
): Promise<{ analytics: SummaryAnalytics }> {
  const summaryProjects = (
    await getSummaryExportProjects(domainId, country, language)
  ).map((project) => ({
    project: project.project,
    country: project.country,
    budget: project.budget,
    spent: project.spent,
  }));

  const budget = summaryProjects.reduce(
    (total, project) => total + project.budget,
    0,
  );
  const spent = summaryProjects.reduce(
    (total, project) => total + project.spent,
    0,
  );

  return {
    analytics: {
      projectCount: summaryProjects.length,
      budget: roundToTwo(budget),
      spent: roundToTwo(spent),
      utilization: budget > 0 ? roundToTwo((spent / budget) * 100) : 0,
      projects: summaryProjects,
    },
  };
}

async function getSummaryExportProjects(
  domainId: string,
  country: string | undefined,
  language: string | null,
): Promise<SummaryExportProject[]> {
  const countryFilter = normalizeCountry(country);

  const projects = await prisma.project.findMany({
    where: {
      domainId,
      isDeleted: false,
      status: StatusEnum.ACTIVE,
      ...(countryFilter
        ? {
            location: {
              is: {
                domainId,
                isDeleted: false,
                OR: [
                  {
                    code: {
                      equals: countryFilter,
                      mode: 'insensitive',
                    },
                  },
                  {
                    searchText: {
                      contains: countryFilter.toLowerCase(),
                    },
                  },
                ],
              },
            },
          }
        : {}),
    },
    select: {
      id: true,
      name: true,
      code: true,
      status: true,
      budget: true,
      spent: true,
      expectedStartDate: true,
      expectedEndDate: true,
      actualStartDate: true,
      actualEndDate: true,
      location: {
        select: {
          code: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return projects.map((project) => {
    const budget = toNumber(project.budget);
    const spent = toNumber(project.spent);

    return {
      id: project.id,
      project: getLocalizedText(project.name, language),
      code: project.code,
      country:
        project.location?.code ||
        getLocalizedText(project.location?.name, language),
      status: project.status,
      budget,
      spent,
      utilization: budget > 0 ? roundToTwo((spent / budget) * 100) : 0,
      expectedStartDate: project.expectedStartDate,
      expectedEndDate: project.expectedEndDate,
      actualStartDate: project.actualStartDate,
      actualEndDate: project.actualEndDate,
    };
  });
}

async function getProjectWorkbookWorksheets(
  domainId: string,
  country: string | undefined,
  projectId: string | undefined,
  language: string | null,
): Promise<ReportWorkbookWorksheet[]> {
  const countryFilter = normalizeCountry(country);
  const projects = await prisma.project.findMany({
    where: {
      domainId,
      isDeleted: false,
      ...(projectId ? { id: projectId } : {}),
      ...(countryFilter
        ? {
            location: {
              is: {
                domainId,
                isDeleted: false,
                OR: [
                  { code: { equals: countryFilter, mode: 'insensitive' } },
                  {
                    searchText: {
                      contains: countryFilter.toLowerCase(),
                    },
                  },
                ],
              },
            },
          }
        : {}),
    },
    select: {
      name: true,
      code: true,
      description: true,
      budget: true,
      spent: true,
      expectedStartDate: true,
      expectedEndDate: true,
      actualStartDate: true,
      actualEndDate: true,
      location: { select: { code: true, name: true } },
      status: true,
      createdAt: true,
      updatedAt: true,
      projectStages: {
        where: { isDeleted: false },
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (projectId && projects.length === 0) {
    throw new Error('not found');
  }

  const projectRows = projects.map((project) => ({
    projectCode: project.code,
    projectName: getLocalizedText(project.name, language),
    projectDescription: normalizeDescription(project.description, language),
    budget: toNumber(project.budget),
    spent: toNumber(project.spent),
    locationCode: project.location.code,
    locationName: getLocalizedText(project.location.name, language),
    projectStatus: project.status,
    expectedStartDate: project.expectedStartDate,
    expectedEndDate: project.expectedEndDate,
    actualStartDate: project.actualStartDate,
    actualEndDate: project.actualEndDate,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  }));

  const projectStageRows = projects.flatMap((project) =>
    project.projectStages.map((stage) => ({
      projectCode: project.code,
      projectName: getLocalizedText(project.name, language),
      stageCode: stage.code,
      stageName: getLocalizedText(stage.name, language),
      stageDescription: normalizeDescription(stage.description, language),
      progress: stage.progress ?? 0,
      expectedStartDate: stage.expectedStartDate,
      expectedEndDate: stage.expectedEndDate,
      actualStartDate: stage.actualStartDate,
      actualEndDate: stage.actualEndDate,
      status: stage.status,
      createdAt: stage.createdAt,
      updatedAt: stage.updatedAt,
    })),
  );

  return [
    worksheet(
      'Projects',
      [
        'projectCode',
        'projectName',
        'projectDescription',
        'budget',
        'spent',
        'locationCode',
        'locationName',
        'projectStatus',
        'expectedStartDate',
        'expectedEndDate',
        'actualStartDate',
        'actualEndDate',
        'createdAt',
        'updatedAt',
      ],
      projectRows,
    ),
    worksheet(
      'Project Stages',
      [
        'projectCode',
        'projectName',
        'stageCode',
        'stageName',
        'stageDescription',
        'progress',
        'expectedStartDate',
        'expectedEndDate',
        'actualStartDate',
        'actualEndDate',
        'status',
        'createdAt',
        'updatedAt',
      ],
      projectStageRows,
    ),
  ];
}

function getAssigneeUserId(value: unknown): string | null {
  if (!isPlainObject(value)) {
    return null;
  }

  return typeof value.userId === 'string' ? value.userId : null;
}

function getApprovalState(task: {
  taskStatus: string;
  requiredApproval: boolean | null;
}): string {
  if (task.taskStatus === 'APPROVED') {
    return 'APPROVED';
  }

  if (task.taskStatus === 'REJECTED') {
    return 'REJECTED';
  }

  if (task.requiredApproval === true || task.taskStatus === 'COMPLETED') {
    return 'PENDING_APPROVAL';
  }

  return 'NOT_SUBMITTED';
}

function getDelayReason(value: unknown, language: string | null): string {
  if (!isPlainObject(value)) {
    return value === null || value === undefined ? '' : String(value);
  }

  const reason = value.reason;

  if (typeof reason === 'string') {
    return reason;
  }

  return getLocalizedText(value, language);
}

type ProjectUserTaskFilters = {
  projectId?: string;
  userId?: string;
};

type MachineSummaryFilters = {
  projectId?: string;
  machineryId?: string;
};

async function getProjectUserTaskReport(
  domainId: string,
  filters: ProjectUserTaskFilters,
  language: string | null,
) {
  const projects = await prisma.project.findMany({
    where: {
      domainId,
      isDeleted: false,
      ...(filters.projectId ? { id: filters.projectId } : {}),
    },
    select: {
      code: true,
      name: true,
      projectUserAssignments: {
        where: {
          domainId,
          isDeleted: false,
          ...(filters.userId ? { userId: filters.userId } : {}),
        },
        select: {
          userId: true,
          startDate: true,
          endDate: true,
          dailyWorkingHours: true,
          dayCharge: true,
          notes: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      projectTasks: {
        where: {
          domainId,
          isDeleted: false,
        },
        select: {
          name: true,
          code: true,
          assignee: true,
          taskStatus: true,
          taskProgress: true,
          requiredApproval: true,
          plannedStartDate: true,
          plannedEndDate: true,
          actualStartDate: true,
          actualEndDate: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          stage: {
            select: {
              code: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (filters.projectId && projects.length === 0) {
    throw new Error('not found');
  }

  const projectTaskDelays = await prisma.projectTaskDelay.findMany({
    where: {
      domainId,
      isDeleted: false,
      ...(filters.projectId ? { projectId: filters.projectId } : {}),
    },
    select: {
      requestedDelayInDays: true,
      delayReason: true,
      requestApproved: true,
      requestApprovalTime: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      project: {
        select: {
          code: true,
          name: true,
        },
      },
      stage: {
        select: {
          code: true,
          name: true,
        },
      },
      task: {
        select: {
          code: true,
          name: true,
          assignee: true,
          totalDelayInDays: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const taskAssigneeIds = [
    ...new Set(
      [
        ...projects.flatMap((project) =>
          project.projectTasks.map((task) => getAssigneeUserId(task.assignee)),
        ),
        ...projectTaskDelays.map((delay) =>
          getAssigneeUserId(delay.task.assignee),
        ),
      ].filter((userId): userId is string => Boolean(userId)),
    ),
  ];
  const users = await prisma.user.findMany({
    where: {
      domainId,
      isDeleted: false,
      id: { in: taskAssigneeIds },
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });
  const usersById = new Map(users.map((user) => [user.id, user]));

  const projectUsers = projects.flatMap((project) =>
    project.projectUserAssignments.map((assignment) => ({
      projectCode: project.code,
      projectName: getLocalizedText(project.name, language),
      userName: assignment.user.name,
      userEmail: assignment.user.email,
      startDate: assignment.startDate,
      endDate: assignment.endDate,
      dailyWorkingHours: assignment.dailyWorkingHours,
      dayCharge: toNumber(assignment.dayCharge),
      notes: assignment.notes,
      status: assignment.status,
      createdAt: assignment.createdAt,
      updatedAt: assignment.updatedAt,
    })),
  );

  const userTasks = projects.flatMap((project) =>
    project.projectTasks.flatMap((task) => {
      const assigneeUserId = getAssigneeUserId(task.assignee);

      if (
        !assigneeUserId ||
        (filters.userId && filters.userId !== assigneeUserId)
      ) {
        return [];
      }

      const user = usersById.get(assigneeUserId);

      return [
        {
          projectCode: project.code,
          projectName: getLocalizedText(project.name, language),
          stageCode: task.stage.code,
          stageName: getLocalizedText(task.stage.name, language),
          taskCode: task.code,
          taskName: getLocalizedText(task.name, language),
          userName: user?.name ?? '',
          userEmail: user?.email ?? '',
          taskStatus: task.taskStatus,
          taskProgress: task.taskProgress ?? 0,
          requiredApproval: task.requiredApproval ?? false,
          approvalState: getApprovalState(task),
          plannedStartDate: task.plannedStartDate,
          plannedEndDate: task.plannedEndDate,
          actualStartDate: task.actualStartDate,
          actualEndDate: task.actualEndDate,
          status: task.status,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
        },
      ];
    }),
  );

  const projectTaskDelaysRows = projectTaskDelays.flatMap((delay) => {
    const assigneeUserId = getAssigneeUserId(delay.task.assignee);

    if (
      !assigneeUserId ||
      (filters.userId && filters.userId !== assigneeUserId)
    ) {
      return [];
    }

    const user = usersById.get(assigneeUserId);

    return [
      {
        projectCode: delay.project.code,
        projectName: getLocalizedText(delay.project.name, language),
        stageCode: delay.stage.code,
        stageName: getLocalizedText(delay.stage.name, language),
        taskCode: delay.task.code,
        taskName: getLocalizedText(delay.task.name, language),
        userName: user?.name ?? '',
        userEmail: user?.email ?? '',
        delayReason: getDelayReason(delay.delayReason, language),
        delayDays: delay.requestedDelayInDays,
        totalDelayInDays: delay.task.totalDelayInDays ?? 0,
        approvalStatus:
          delay.requestApproved === null
            ? 'PENDING'
            : delay.requestApproved
              ? 'APPROVED'
              : 'REJECTED',
        approvalTime: delay.requestApprovalTime,
        status: delay.status,
        createdAt: delay.createdAt,
        updatedAt: delay.updatedAt,
      },
    ];
  });

  return { projectUsers, userTasks, projectTaskDelays: projectTaskDelaysRows };
}

async function getProjectUserTaskWorkbookWorksheets(
  domainId: string,
  filters: ProjectUserTaskFilters,
  language: string | null,
): Promise<ReportWorkbookWorksheet[]> {
  const report = await getProjectUserTaskReport(domainId, filters, language);

  return [
    worksheet(
      'Project Users',
      [
        'projectCode',
        'projectName',
        'userName',
        'userEmail',
        'startDate',
        'endDate',
        'dailyWorkingHours',
        'dayCharge',
        'notes',
        'status',
        'createdAt',
        'updatedAt',
      ],
      report.projectUsers,
    ),
    worksheet(
      'User Tasks',
      [
        'projectCode',
        'projectName',
        'stageCode',
        'stageName',
        'taskCode',
        'taskName',
        'userName',
        'userEmail',
        'taskStatus',
        'taskProgress',
        'requiredApproval',
        'approvalState',
        'plannedStartDate',
        'plannedEndDate',
        'actualStartDate',
        'actualEndDate',
        'status',
        'createdAt',
        'updatedAt',
      ],
      report.userTasks,
    ),
    worksheet(
      'Project Task Delays',
      [
        'projectCode',
        'projectName',
        'stageCode',
        'stageName',
        'taskCode',
        'taskName',
        'userName',
        'userEmail',
        'delayReason',
        'delayDays',
        'totalDelayInDays',
        'approvalStatus',
        'approvalTime',
        'status',
        'createdAt',
        'updatedAt',
      ],
      report.projectTaskDelays,
    ),
  ];
}

async function getMachineSummaryReport(
  domainId: string,
  filters: MachineSummaryFilters,
  language: string | null,
) {
  const machineries = await prisma.machinery.findMany({
    where: {
      domainId,
      isDeleted: false,
      ...(filters.projectId ? { projectId: filters.projectId } : {}),
      ...(filters.machineryId ? { id: filters.machineryId } : {}),
    },
    select: {
      code: true,
      type: true,
      expectedLitrePerHour: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      project: {
        select: {
          code: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (filters.machineryId && machineries.length === 0) {
    throw new Error('not found');
  }

  const machineReadings = await prisma.machineReading.findMany({
    where: {
      domainId,
      isDeleted: false,
      ...(filters.projectId ? { projectId: filters.projectId } : {}),
      ...(filters.machineryId ? { machineryId: filters.machineryId } : {}),
    },
    select: {
      code: true,
      date: true,
      openingFuelStock: true,
      closingFuelStock: true,
      fuelRefillQuantity: true,
      fuelConsumed: true,
      actualLitrePerHour: true,
      hoursRun: true,
      machineStartTime: true,
      machineEndTime: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      project: {
        select: {
          code: true,
          name: true,
        },
      },
      machinery: {
        select: {
          code: true,
          type: true,
          expectedLitrePerHour: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const machines = machineries.map((machinery) => ({
    projectCode: machinery.project.code,
    projectName: getLocalizedText(machinery.project.name, language),
    machineCode: machinery.code,
    machineType: getLocalizedText(machinery.type, language),
    expectedLitrePerHour: machinery.expectedLitrePerHour,
    status: machinery.status,
    createdAt: machinery.createdAt,
    updatedAt: machinery.updatedAt,
  }));

  const readings = machineReadings.map((reading) => ({
    projectCode: reading.project.code,
    projectName: getLocalizedText(reading.project.name, language),
    machineCode: reading.machinery?.code ?? '',
    machineType: reading.machinery
      ? getLocalizedText(reading.machinery.type, language)
      : '',
    readingCode: reading.code,
    readingDate: reading.date,
    openingFuelStock: reading.openingFuelStock,
    closingFuelStock: reading.closingFuelStock,
    fuelRefillQuantity: reading.fuelRefillQuantity,
    fuelConsumed: reading.fuelConsumed,
    hoursRun: reading.hoursRun ?? 0,
    expectedLitrePerHour: reading.machinery?.expectedLitrePerHour ?? null,
    actualLitrePerHour: reading.actualLitrePerHour,
    machineStartTime: reading.machineStartTime,
    machineEndTime: reading.machineEndTime,
    status: reading.status,
    createdAt: reading.createdAt,
    updatedAt: reading.updatedAt,
  }));

  return { machines, machineReadings: readings };
}

async function getMachineWorkbookWorksheets(
  domainId: string,
  filters: MachineSummaryFilters,
  language: string | null,
): Promise<ReportWorkbookWorksheet[]> {
  const report = await getMachineSummaryReport(domainId, filters, language);

  return [
    worksheet(
      'Machines',
      [
        'projectCode',
        'projectName',
        'machineCode',
        'machineType',
        'expectedLitrePerHour',
        'status',
        'createdAt',
        'updatedAt',
      ],
      report.machines,
    ),
    worksheet(
      'Machine Readings',
      [
        'projectCode',
        'projectName',
        'machineCode',
        'machineType',
        'readingCode',
        'readingDate',
        'openingFuelStock',
        'closingFuelStock',
        'fuelRefillQuantity',
        'fuelConsumed',
        'hoursRun',
        'expectedLitrePerHour',
        'actualLitrePerHour',
        'machineStartTime',
        'machineEndTime',
        'status',
        'createdAt',
        'updatedAt',
      ],
      report.machineReadings,
    ),
  ];
}

// ─── NEW: Product Inventory ───────────────────────────────────────────────────

type ProductInventoryFilters = {
  productId?: string;
  status?: 'ACTIVE' | 'INACTIVE';
};

async function getProductInventoryReport(
  domainId: string,
  filters: ProductInventoryFilters,
  language: string | null,
) {
  const allUoms = await prisma.uom.findMany({
    where: { domainId, isDeleted: false },
  });
  const uomMap = new Map(allUoms.map((u) => [u.id, u]));

  const products = await prisma.product.findMany({
    where: {
      domainId,
      isDeleted: false,
      ...(filters.productId ? { id: filters.productId } : {}),
      ...(filters.status ? { status: filters.status } : {}),
    },
    include: {
      productUoms: {
        where: { isDeleted: false },
        include: { uom: true },
      },
      productGrades: {
        where: { isDeleted: false },
        include: {
          productGradeStdRates: {
            where: { isDeleted: false },
          },
        },
      },
      inventories: {
        where: { isDeleted: false },
        include: { uom: true, productGrade: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const formattedProducts = products.map((product) => {
    const uoms = product.productUoms.map((pu) => {
      const baseUom = pu.uom.baseUomId ? uomMap.get(pu.uom.baseUomId) : null;
      return {
        code: pu.uom.code,
        name: getLocalizedText(pu.uom.displayName, language),
        conversionRate: pu.uom.conversionRate,
        baseUomName: baseUom
          ? getLocalizedText(baseUom.displayName, language)
          : 'N/A',
        createdAt: pu.uom.createdAt,
        updatedAt: pu.uom.updatedAt,
      };
    });

    const grades = product.productGrades.map((grade) => {
      const stdRates = grade.productGradeStdRates.map((rate) => ({
        type: getLocalizedText(rate.stdRateType, language),
        value: rate.stdRateValue,
        alertThreshold: rate.alertThresold,
      }));

      return {
        code: grade.gradeCode,
        name: getLocalizedText(grade.gradeDisplayName, language),
        createdAt: grade.createdAt,
        updatedAt: grade.updatedAt,
        stdRates,
      };
    });

    const inventory = product.inventories.map((inv) => ({
      gradeCode: inv.productGrade.gradeCode,
      gradeName: getLocalizedText(inv.productGrade.gradeDisplayName, language),
      quantity: inv.quantity,
      uomCode: inv.uom.code,
      reorderLevel: inv.reorderLevel,
      lowStock: inv.quantity <= inv.reorderLevel,
      createdAt: inv.createdAt,
      updatedAt: inv.updatedAt,
    }));

    const totalQuantity = inventory.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );

    return {
      id: product.id,
      code: product.code,
      displayName: getLocalizedText(product.displayName, language),
      productType: product.productType,
      status: product.status,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      uoms,
      grades,
      inventory,
      totalQuantity,
    };
  });

  const totalProducts = formattedProducts.length;
  const totalInventoryQuantity = formattedProducts.reduce(
    (sum, p) => sum + p.totalQuantity,
    0,
  );
  const lowStockCount = formattedProducts.reduce(
    (sum, p) => sum + p.inventory.filter((inv) => inv.lowStock).length,
    0,
  );

  const allLowStockItems = formattedProducts.flatMap((p) =>
    p.inventory
      .filter((inv) => inv.lowStock)
      .map((inv) => ({
        productCode: p.code,
        productName: p.displayName,
        gradeCode: inv.gradeCode,
        gradeName: inv.gradeName,
        quantity: inv.quantity,
        reorderLevel: inv.reorderLevel,
        uomCode: inv.uomCode,
      })),
  );

  const lowStockTop5 = allLowStockItems
    .sort((a, b) => a.quantity - b.quantity)
    .slice(0, 5);

  return {
    analytics: {
      totalProducts,
      totalInventoryQuantity: roundToTwo(totalInventoryQuantity),
      lowStockCount,
      lowStock: lowStockTop5,
    },
    products: formattedProducts,
  };
}

async function getProductInventoryWorkbookWorksheets(
  domainId: string,
  filters: ProductInventoryFilters,
  language: string | null,
): Promise<ReportWorkbookWorksheet[]> {
  const report = await getProductInventoryReport(domainId, filters, language);

  const productRows = report.products.map((p) => ({
    productCode: p.code,
    productName: p.displayName,
    productType: p.productType,
    status: p.status,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }));

  const uomRows = report.products.flatMap((p) =>
    p.uoms.map((u) => ({
      productCode: p.code,
      productName: p.displayName,
      uomCode: u.code,
      uomName: u.name,
      baseUomName: u.baseUomName,
      conversionRate: u.conversionRate,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    })),
  );

  const gradeRows = report.products.flatMap((p) =>
    p.grades.flatMap((g) => {
      if (g.stdRates.length === 0) {
        return [
          {
            productCode: p.code,
            productName: p.displayName,
            gradeCode: g.code,
            gradeName: g.name,
            stdRateType: 'N/A',
            stdRateValue: 0,
            alertThreshold: 0,
            createdAt: g.createdAt,
            updatedAt: g.updatedAt,
          },
        ];
      }
      return g.stdRates.map((rate) => ({
        productCode: p.code,
        productName: p.displayName,
        gradeCode: g.code,
        gradeName: g.name,
        stdRateType: rate.type,
        stdRateValue: rate.value,
        alertThreshold: rate.alertThreshold,
        createdAt: g.createdAt,
        updatedAt: g.updatedAt,
      }));
    }),
  );

  const inventoryRows = report.products.flatMap((p) =>
    p.inventory.map((inv) => ({
      productCode: p.code,
      productName: p.displayName,
      gradeCode: inv.gradeCode,
      gradeName: inv.gradeName,
      quantity: inv.quantity,
      uomCode: inv.uomCode,
      reorderLevel: inv.reorderLevel,
      lowStock: inv.lowStock ? 'Yes' : 'No',
      createdAt: inv.createdAt,
      updatedAt: inv.updatedAt,
    })),
  );

  return [
    worksheet(
      'Products',
      [
        'productCode',
        'productName',
        'productType',
        'status',
        'createdAt',
        'updatedAt',
      ],
      productRows,
    ),
    worksheet(
      'Product UOMs',
      [
        'productCode',
        'productName',
        'uomCode',
        'uomName',
        'baseUomName',
        'conversionRate',
        'createdAt',
        'updatedAt',
      ],
      uomRows,
    ),
    worksheet(
      'Product Grades & Rates',
      [
        'productCode',
        'productName',
        'gradeCode',
        'gradeName',
        'stdRateType',
        'stdRateValue',
        'alertThreshold',
        'createdAt',
        'updatedAt',
      ],
      gradeRows,
    ),
    worksheet(
      'Inventory Status',
      [
        'productCode',
        'productName',
        'gradeCode',
        'gradeName',
        'quantity',
        'uomCode',
        'reorderLevel',
        'lowStock',
        'createdAt',
        'updatedAt',
      ],
      inventoryRows,
    ),
  ];
}

// ─── NEW: Vendor Purchase History ─────────────────────────────────────────────

type VendorPurchaseHistoryFilters = {
  vendorId?: string;
  projectId?: string;
};

async function getVendorPurchaseHistoryReport(
  domainId: string,
  filters: VendorPurchaseHistoryFilters,
  language: string | null,
) {
  const vendors = await prisma.vendor.findMany({
    where: {
      domainId,
      isDeleted: false,
      ...(filters.vendorId ? { id: filters.vendorId } : {}),
    },
    orderBy: { name: 'asc' },
  });

  const invoices = await prisma.invoice.findMany({
    where: {
      domainId,
      isDeleted: false,
      ...(filters.projectId ? { projectId: filters.projectId } : {}),
    },
    include: {
      project: { select: { code: true, name: true } },
    },
    orderBy: { invoiceDate: 'desc' },
  });

  const grns = await prisma.grn.findMany({
    where: {
      domainId,
      isDeleted: false,
      ...(filters.projectId ? { projectId: filters.projectId } : {}),
    },
    include: {
      project: { select: { code: true, name: true } },
    },
    orderBy: { date: 'desc' },
  });

  const vendorGroups = new Map<
    string,
    {
      vendorCode: string;
      vendorName: string;
      vendorEmail: string;
      contactPerson: string;
      phone: string;
      address: string;
      invoices: typeof invoices;
      grns: typeof grns;
    }
  >();

  vendors.forEach((v) => {
    const normalizedKey = v.name.toLowerCase().trim();
    vendorGroups.set(normalizedKey, {
      vendorCode: v.code,
      vendorName: v.name,
      vendorEmail: v.email,
      contactPerson: v.contactPerson || 'N/A',
      phone: `${v.phoneCode || ''} ${v.phone || ''}`.trim() || 'N/A',
      address: v.address || 'N/A',
      invoices: [],
      grns: [],
    });
  });

  const getOrCreateGroup = (vName: string) => {
    const key = vName.trim();
    const normalizedKey = key.toLowerCase();
    if (!vendorGroups.has(normalizedKey)) {
      vendorGroups.set(normalizedKey, {
        vendorCode: 'N/A',
        vendorName: key,
        vendorEmail: 'N/A',
        contactPerson: 'N/A',
        phone: 'N/A',
        address: 'N/A',
        invoices: [],
        grns: [],
      });
    }
    return vendorGroups.get(normalizedKey)!;
  };

  invoices.forEach((inv) => {
    const group = getOrCreateGroup(inv.vendorName);
    group.invoices.push(inv);
  });

  grns.forEach((grn) => {
    const group = getOrCreateGroup(grn.vendorName);
    group.grns.push(grn);
  });

  let groupsArray = Array.from(vendorGroups.values());
  if (filters.vendorId) {
    const targetVendor = vendors.find((v) => v.id === filters.vendorId);
    if (targetVendor) {
      groupsArray = groupsArray.filter(
        (g) =>
          g.vendorName.toLowerCase().trim() ===
          targetVendor.name.toLowerCase().trim(),
      );
    } else {
      groupsArray = [];
    }
  }

  const formattedVendors = groupsArray.map((group) => {
    const totalInvoices = group.invoices.length;
    const totalInvoicedAmount = group.invoices.reduce(
      (sum, inv) => sum + toNumber(inv.totalAmount),
      0,
    );

    const totalGrns = group.grns.length;
    const totalGrnAmount = group.grns.reduce(
      (sum, grn) => sum + toNumber(grn.totalAmount),
      0,
    );

    const paymentStatusSummary: Record<
      string,
      { count: number; amount: number }
    > = {};
    group.invoices.forEach((inv) => {
      const status = inv.paymentStatus;
      if (!paymentStatusSummary[status]) {
        paymentStatusSummary[status] = { count: 0, amount: 0 };
      }
      paymentStatusSummary[status].count += 1;
      paymentStatusSummary[status].amount += toNumber(inv.totalAmount);
    });

    return {
      vendorCode: group.vendorCode,
      vendorName: group.vendorName,
      vendorEmail: group.vendorEmail,
      contactPerson: group.contactPerson,
      phone: group.phone,
      address: group.address,
      totalInvoices,
      totalInvoicedAmount: roundToTwo(totalInvoicedAmount),
      totalGrns,
      totalGrnAmount: roundToTwo(totalGrnAmount),
      paymentStatusSummary,
      invoices: group.invoices.map((inv) => ({
        invoiceCode: inv.invoiceCode,
        invoiceDate: inv.invoiceDate,
        dueDate: inv.dueDate,
        totalAmount: toNumber(inv.totalAmount),
        totalTax: toNumber(inv.totalTax),
        paymentStatus: inv.paymentStatus,
        projectCode: inv.project.code,
        projectName: getLocalizedText(inv.project.name, language),
      })),
      grns: group.grns.map((grn) => ({
        grnCode: grn.code,
        productOrderCode: grn.productOrderCode,
        date: grn.date,
        wbReference: grn.wbReference,
        totalItems: grn.totalItems,
        totalAmount: toNumber(grn.totalAmount),
        projectCode: grn.project ? grn.project.code : 'N/A',
        projectName: grn.project
          ? getLocalizedText(grn.project.name, language)
          : 'N/A',
      })),
    };
  });

  const totalVendors = formattedVendors.length;
  const totalInvoicedAmount = formattedVendors.reduce(
    (sum, v) => sum + v.totalInvoicedAmount,
    0,
  );
  const totalGrnAmount = formattedVendors.reduce(
    (sum, v) => sum + v.totalGrnAmount,
    0,
  );

  return {
    analytics: {
      totalVendors,
      totalInvoicedAmount: roundToTwo(totalInvoicedAmount),
      totalGrnAmount: roundToTwo(totalGrnAmount),
    },
    vendors: formattedVendors,
  };
}

// ─── NEW: Product Transaction History ─────────────────────────────────────────

type ProductTransactionHistoryFilters = {
  productId?: string;
  projectId?: string;
  startDate?: string;
  endDate?: string;
};

async function getProductTransactionHistoryReport(
  domainId: string,
  filters: ProductTransactionHistoryFilters,
  language: string | null,
) {
  const parsedStartDate = filters.startDate
    ? new Date(filters.startDate)
    : undefined;
  const parsedEndDate = filters.endDate ? new Date(filters.endDate) : undefined;

  const rmprs = await prisma.rawMaterialPurchaseRequest.findMany({
    where: {
      domainId,
      isDeleted: false,
      ...(filters.productId ? { productId: filters.productId } : {}),
      ...(filters.projectId ? { projectId: filters.projectId } : {}),
      ...(parsedStartDate || parsedEndDate
        ? {
            createdAt: {
              ...(parsedStartDate ? { gte: parsedStartDate } : {}),
              ...(parsedEndDate ? { lte: parsedEndDate } : {}),
            },
          }
        : {}),
    },
    include: {
      product: true,
      productGrade: true,
      uom: true,
      project: { select: { code: true, name: true } },
      requestedUser: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const invoiceItems = await prisma.invoiceItem.findMany({
    where: {
      domainId,
      invoice: {
        isDeleted: false,
        ...(filters.projectId ? { projectId: filters.projectId } : {}),
        ...(parsedStartDate || parsedEndDate
          ? {
              invoiceDate: {
                ...(parsedStartDate ? { gte: parsedStartDate } : {}),
                ...(parsedEndDate ? { lte: parsedEndDate } : {}),
              },
            }
          : {}),
      },
      ...(filters.productId ? { productId: filters.productId } : {}),
    },
    include: {
      product: true,
      productGrade: true,
      uom: true,
      invoice: {
        include: {
          project: { select: { code: true, name: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const grnProducts = await prisma.grnProduct.findMany({
    where: {
      domainId,
      isDeleted: false,
      ...(filters.projectId ? { projectId: filters.projectId } : {}),
      ...(parsedStartDate || parsedEndDate
        ? {
            date: {
              ...(parsedStartDate ? { gte: parsedStartDate } : {}),
              ...(parsedEndDate ? { lte: parsedEndDate } : {}),
            },
          }
        : {}),
      ...(filters.productId
        ? {
            invoice: {
              items: {
                some: {
                  productId: filters.productId,
                },
              },
            },
          }
        : {}),
    },
    include: {
      uom: true,
      project: { select: { code: true, name: true } },
      grn: { select: { approvalStatus: true } },
      invoice: {
        include: {
          items: {
            where: {
              ...(filters.productId ? { productId: filters.productId } : {}),
            },
            include: {
              product: true,
              productGrade: true,
            },
          },
        },
      },
    },
    orderBy: { date: 'desc' },
  });

  const transactions: Record<string, any>[] = [];

  rmprs.forEach((r) => {
    transactions.push({
      date: r.createdAt,
      type: 'Requisition',
      code: r.code,
      productCode: r.product.code,
      productName: getLocalizedText(r.product.displayName, language),
      gradeCode: r.productGrade.gradeCode,
      gradeName: getLocalizedText(r.productGrade.gradeDisplayName, language),
      quantity: r.quantity,
      uom: r.uom.code,
      unitRate: 0,
      totalAmount: 0,
      projectCode: r.project.code,
      projectName: getLocalizedText(r.project.name, language),
      reference: r.requestedUser?.name || 'N/A',
      status: r.approvalStatus,
    });
  });

  invoiceItems.forEach((item) => {
    const qty = toNumber(item.quantity);
    const amt = toNumber(item.totalAmount);
    transactions.push({
      date: item.invoice.invoiceDate,
      type: 'Invoice',
      code: item.invoice.invoiceCode,
      productCode: item.product.code,
      productName: getLocalizedText(item.product.displayName, language),
      gradeCode: item.productGrade?.gradeCode || 'N/A',
      gradeName: item.productGrade
        ? getLocalizedText(item.productGrade.gradeDisplayName, language)
        : 'N/A',
      quantity: qty,
      uom: item.uom.code,
      unitRate: qty > 0 ? roundToTwo(amt / qty) : 0,
      totalAmount: amt,
      projectCode: item.invoice.project.code,
      projectName: getLocalizedText(item.invoice.project.name, language),
      reference: item.invoice.vendorName,
      status: item.invoice.paymentStatus,
    });
  });

  const allProducts = await prisma.product.findMany({
    where: { domainId, isDeleted: false },
    include: {
      productGrades: {
        where: { isDeleted: false },
      },
    },
  });

  grnProducts.forEach((item) => {
    const associatedItem = item.invoice.items.find(
      (ii) => ii.uomId === item.uomId,
    );

    let productCode = 'N/A';
    let productName = item.material;
    let gradeCode = 'N/A';
    let gradeName = 'N/A';
    let productId = '';

    if (associatedItem) {
      productId = associatedItem.productId;
      productName = associatedItem.product
        ? getLocalizedText(associatedItem.product.displayName, language)
        : item.material;
      productCode = associatedItem.product?.code || 'N/A';
      gradeCode = associatedItem.productGrade?.gradeCode || 'N/A';
      gradeName = associatedItem.productGrade
        ? getLocalizedText(
            associatedItem.productGrade.gradeDisplayName,
            language,
          )
        : 'N/A';
    } else {
      // Fallback matching when associated invoice item is missing
      const materialStr = item.material.toLowerCase().trim();
      const matchedProduct = allProducts.find(
        (p) =>
          p.code.toLowerCase().trim() === materialStr ||
          getLocalizedText(p.displayName, language).toLowerCase().trim() ===
            materialStr,
      );

      if (matchedProduct) {
        productId = matchedProduct.id;
        productName = getLocalizedText(matchedProduct.displayName, language);
        productCode = matchedProduct.code;

        // Try to match grade by checking if gradeCode or grade name is in material name
        const matchedGrade =
          matchedProduct.productGrades.find(
            (g) =>
              materialStr.includes(g.gradeCode.toLowerCase().trim()) ||
              materialStr.includes(
                getLocalizedText(g.gradeDisplayName, language)
                  .toLowerCase()
                  .trim(),
              ),
          ) || matchedProduct.productGrades[0];

        if (matchedGrade) {
          gradeCode = matchedGrade.gradeCode;
          gradeName = getLocalizedText(matchedGrade.gradeDisplayName, language);
        }
      }
    }

    if (filters.productId && productId !== filters.productId) {
      return;
    }

    transactions.push({
      date: item.date,
      type: 'Receipt (GRN)',
      code: item.grnCode,
      productCode,
      productName,
      gradeCode,
      gradeName,
      quantity: item.quantity,
      uom: item.uom.code,
      unitRate: item.rate,
      totalAmount: roundToTwo(item.quantity * item.rate),
      projectCode: item.project?.code || 'N/A',
      projectName: item.project
        ? getLocalizedText(item.project.name, language)
        : 'N/A',
      reference: item.vendor,
      status: item.grn?.approvalStatus || 'PENDING',
    });
  });

  transactions.sort((a, b) => b.date.getTime() - a.date.getTime());

  return { transactions };
}

async function getProductTransactionHistoryWorkbookWorksheets(
  domainId: string,
  filters: ProductTransactionHistoryFilters,
  language: string | null,
): Promise<ReportWorkbookWorksheet[]> {
  const report = await getProductTransactionHistoryReport(
    domainId,
    filters,
    language,
  );

  const rows = report.transactions.map((t) => ({
    date: t.date,
    type: t.type,
    code: t.code,
    productCode: t.productCode,
    productName: t.productName,
    gradeCode: t.gradeCode,
    gradeName: t.gradeName,
    quantity: t.quantity,
    uom: t.uom,
    unitRate: t.unitRate,
    totalAmount: t.totalAmount,
    projectCode: t.projectCode,
    projectName: t.projectName,
    reference: t.reference,
    status: t.status,
  }));

  return [
    worksheet(
      'Transactions History',
      [
        'date',
        'type',
        'code',
        'productCode',
        'productName',
        'gradeCode',
        'gradeName',
        'quantity',
        'uom',
        'unitRate',
        'totalAmount',
        'projectCode',
        'projectName',
        'reference',
        'status',
      ],
      rows,
    ),
  ];
}

// ─── NEW: Vendor Purchase History ─────────────────────────────────────────────

async function getVendorPurchaseHistoryWorkbookWorksheets(
  domainId: string,
  filters: VendorPurchaseHistoryFilters,
  language: string | null,
): Promise<ReportWorkbookWorksheet[]> {
  const report = await getVendorPurchaseHistoryReport(
    domainId,
    filters,
    language,
  );

  const summaryRows = report.vendors.map((v) => ({
    vendorCode: v.vendorCode,
    vendorName: v.vendorName,
    vendorEmail: v.vendorEmail,
    contactPerson: v.contactPerson,
    phone: v.phone,
    totalInvoices: v.totalInvoices,
    totalInvoicedAmount: v.totalInvoicedAmount,
    totalGrns: v.totalGrns,
    totalGrnAmount: v.totalGrnAmount,
  }));

  const invoiceRows = report.vendors.flatMap((v) =>
    v.invoices.map((inv) => ({
      vendorName: v.vendorName,
      invoiceCode: inv.invoiceCode,
      invoiceDate: inv.invoiceDate,
      dueDate: inv.dueDate,
      totalAmount: inv.totalAmount,
      totalTax: inv.totalTax,
      paymentStatus: inv.paymentStatus,
      projectCode: inv.projectCode,
      projectName: inv.projectName,
    })),
  );

  const grnRows = report.vendors.flatMap((v) =>
    v.grns.map((grn) => ({
      vendorName: v.vendorName,
      grnCode: grn.grnCode,
      productOrderCode: grn.productOrderCode,
      date: grn.date,
      wbReference: grn.wbReference || 'N/A',
      totalItems: grn.totalItems,
      totalAmount: grn.totalAmount,
      projectCode: grn.projectCode,
      projectName: grn.projectName,
    })),
  );

  return [
    worksheet(
      'Vendor Summary',
      [
        'vendorCode',
        'vendorName',
        'vendorEmail',
        'contactPerson',
        'phone',
        'totalInvoices',
        'totalInvoicedAmount',
        'totalGrns',
        'totalGrnAmount',
      ],
      summaryRows,
    ),
    worksheet(
      'Vendor Invoices',
      [
        'vendorName',
        'invoiceCode',
        'invoiceDate',
        'dueDate',
        'totalAmount',
        'totalTax',
        'paymentStatus',
        'projectCode',
        'projectName',
      ],
      invoiceRows,
    ),
    worksheet(
      'Vendor GRNs',
      [
        'vendorName',
        'grnCode',
        'productOrderCode',
        'date',
        'wbReference',
        'totalItems',
        'totalAmount',
        'projectCode',
        'projectName',
      ],
      grnRows,
    ),
  ];
}

// ─── NEW: Product Transaction History ─────────────────────────────────────────

export const reportService = {
  getProjectSummary: async (
    domainId: string,
    filters: { country?: string },
    language: string | null = null,
  ) => {
    try {
      return await getSummaryReport(domainId, filters.country, language);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  getSummaryExportProjects: async (
    domainId: string,
    filters: { country?: string },
    language: string | null = null,
  ): Promise<SummaryExportProject[]> => {
    try {
      return await getSummaryExportProjects(
        domainId,
        filters.country,
        language,
      );
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  getProjectWorkbookWorksheets: async (
    domainId: string,
    filters: { country?: string; projectId?: string },
    language: string | null = null,
  ): Promise<ReportWorkbookWorksheet[]> => {
    try {
      return await getProjectWorkbookWorksheets(
        domainId,
        filters.country,
        filters.projectId,
        language,
      );
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  getProjectUserTaskReport: async (
    domainId: string,
    filters: ProjectUserTaskFilters,
    language: string | null = null,
  ) => {
    try {
      return await getProjectUserTaskReport(domainId, filters, language);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  getProjectUserTaskWorkbookWorksheets: async (
    domainId: string,
    filters: ProjectUserTaskFilters,
    language: string | null = null,
  ): Promise<ReportWorkbookWorksheet[]> => {
    try {
      return await getProjectUserTaskWorkbookWorksheets(
        domainId,
        filters,
        language,
      );
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  getMachineSummaryReport: async (
    domainId: string,
    filters: MachineSummaryFilters,
    language: string | null = null,
  ) => {
    try {
      return await getMachineSummaryReport(domainId, filters, language);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  getMachineWorkbookWorksheets: async (
    domainId: string,
    filters: MachineSummaryFilters,
    language: string | null = null,
  ): Promise<ReportWorkbookWorksheet[]> => {
    try {
      return await getMachineWorkbookWorksheets(domainId, filters, language);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  getProductInventoryReport: async (
    domainId: string,
    filters: ProductInventoryFilters,
    language: string | null = null,
  ) => {
    try {
      return await getProductInventoryReport(domainId, filters, language);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  getProductInventoryWorkbookWorksheets: async (
    domainId: string,
    filters: ProductInventoryFilters,
    language: string | null = null,
  ): Promise<ReportWorkbookWorksheet[]> => {
    try {
      return await getProductInventoryWorkbookWorksheets(
        domainId,
        filters,
        language,
      );
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  getVendorPurchaseHistoryReport: async (
    domainId: string,
    filters: VendorPurchaseHistoryFilters,
    language: string | null = null,
  ) => {
    try {
      return await getVendorPurchaseHistoryReport(domainId, filters, language);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  getVendorPurchaseHistoryWorkbookWorksheets: async (
    domainId: string,
    filters: VendorPurchaseHistoryFilters,
    language: string | null = null,
  ): Promise<ReportWorkbookWorksheet[]> => {
    try {
      return await getVendorPurchaseHistoryWorkbookWorksheets(
        domainId,
        filters,
        language,
      );
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  getProductTransactionHistoryReport: async (
    domainId: string,
    filters: ProductTransactionHistoryFilters,
    language: string | null = null,
  ) => {
    try {
      return await getProductTransactionHistoryReport(
        domainId,
        filters,
        language,
      );
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  getProductTransactionHistoryWorkbookWorksheets: async (
    domainId: string,
    filters: ProductTransactionHistoryFilters,
    language: string | null = null,
  ): Promise<ReportWorkbookWorksheet[]> => {
    try {
      return await getProductTransactionHistoryWorkbookWorksheets(
        domainId,
        filters,
        language,
      );
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },
};
