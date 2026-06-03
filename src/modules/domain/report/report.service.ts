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
};
