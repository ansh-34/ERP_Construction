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

type MachineSummaryExportFilters = MachineSummaryFilters & {
  vehicleId?: string;
};

type MachineIdentity = {
  id: string;
  code: string;
  type: unknown;
  project: {
    code: string;
    name: unknown;
  };
};

type UserTaskSummary = {
  userName: string;
  userEmail: string;
  taskCount: number;
};

type ProjectUserSummary = {
  userName: string;
  userEmail: string;
  projectCount: number;
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
          taskProgress: true,
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
        taskProgress: delay.task.taskProgress ?? 0,
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

function getTopUserTaskCounts(userTasks: any[]): UserTaskSummary[] {
  const userTaskCounts = new Map<string, UserTaskSummary>();

  userTasks.forEach((task) => {
    const key = task.userEmail || task.userName;
    if (!key) return;

    const current = userTaskCounts.get(key) ?? {
      userName: task.userName,
      userEmail: task.userEmail,
      taskCount: 0,
    };

    current.taskCount += 1;
    userTaskCounts.set(key, current);
  });

  return [...userTaskCounts.values()]
    .sort((a, b) => b.taskCount - a.taskCount)
    .slice(0, 5);
}

function getTopProjectUserCounts(projectUsers: any[]): ProjectUserSummary[] {
  const userProjects = new Map<
    string,
    ProjectUserSummary & { projectCodes: Set<string> }
  >();

  projectUsers.forEach((assignment) => {
    const key = assignment.userEmail || assignment.userName;
    if (!key) return;

    const current = userProjects.get(key) ?? {
      userName: assignment.userName,
      userEmail: assignment.userEmail,
      projectCount: 0,
      projectCodes: new Set<string>(),
    };

    current.projectCodes.add(assignment.projectCode);
    current.projectCount = current.projectCodes.size;
    userProjects.set(key, current);
  });

  return [...userProjects.values()]
    .map(({ projectCodes: _projectCodes, ...summary }) => summary)
    .sort((a, b) => b.projectCount - a.projectCount)
    .slice(0, 5);
}

async function getProjectUserTaskSummaryReport(
  domainId: string,
  filters: ProjectUserTaskFilters,
  language: string | null,
) {
  const report = await getProjectUserTaskReport(domainId, filters, language);

  return {
    lowProgressTasks: [...report.userTasks]
      .sort((a, b) => a.taskProgress - b.taskProgress)
      .slice(0, 10),
    topTaskUsers: getTopUserTaskCounts(report.userTasks),
    topProjectUsers: getTopProjectUserCounts(report.projectUsers),
    topTaskDelays: [...report.projectTaskDelays]
      .sort((a, b) => b.totalDelayInDays - a.totalDelayInDays)
      .slice(0, 5),
  };
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
        'taskProgress',
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

function machineSummaryBase(machine: MachineIdentity, language: string | null) {
  return {
    machineCode: machine.code,
    machineType: getLocalizedText(machine.type, language),
    projectCode: machine.project.code,
    projectName: getLocalizedText(machine.project.name, language),
  };
}

async function getMachineIdentities(
  domainId: string,
  machineIds: string[],
): Promise<Map<string, MachineIdentity>> {
  const uniqueMachineIds = [...new Set(machineIds)].filter(Boolean);

  if (uniqueMachineIds.length === 0) {
    return new Map();
  }

  const machineries = await prisma.machinery.findMany({
    where: {
      domainId,
      isDeleted: false,
      id: { in: uniqueMachineIds },
    },
    select: {
      id: true,
      code: true,
      type: true,
      project: {
        select: {
          code: true,
          name: true,
        },
      },
    },
  });

  return new Map(machineries.map((machine) => [machine.id, machine]));
}

async function getMachineSummaryDashboardReport(
  domainId: string,
  filters: MachineSummaryFilters,
  language: string | null,
) {
  const machineFilter = {
    domainId,
    isDeleted: false,
    ...(filters.machineryId ? { id: filters.machineryId } : {}),
    ...(filters.projectId ? { projectId: filters.projectId } : {}),
  };

  const machineIds = (
    await prisma.machinery.findMany({
      where: machineFilter,
      select: { id: true },
    })
  ).map((machine) => machine.id);

  if (filters.machineryId && machineIds.length === 0) {
    throw new Error('not found');
  }

  if (machineIds.length === 0) {
    return {
      topWorkingHourMachines: [],
      topMaintenanceMachines: [],
      topMovementMachines: [],
      upcomingSchedules: [],
    };
  }

  const [workingHourRows, maintenanceRows, movementRows, upcomingSchedules] =
    await Promise.all([
      prisma.machineReading.groupBy({
        by: ['machineryId'],
        where: {
          domainId,
          isDeleted: false,
          machineryId: { in: machineIds },
        },
        _sum: { hoursRun: true },
        orderBy: { _sum: { hoursRun: 'desc' } },
        take: 5,
      }),
      prisma.maintenanceLog.groupBy({
        by: ['machineryId'],
        where: {
          domainId,
          isDeleted: false,
          assetType: 'MACHINERY',
          machineryId: { in: machineIds },
        },
        _count: { machineryId: true },
        orderBy: { _count: { machineryId: 'desc' } },
        take: 5,
      }),
      prisma.movementLog.groupBy({
        by: ['machineryId'],
        where: {
          domainId,
          isDeleted: false,
          assetType: 'MACHINERY',
          machineryId: { in: machineIds },
        },
        _count: { machineryId: true },
        orderBy: { _count: { machineryId: 'desc' } },
        take: 5,
      }),
      prisma.maintenanceSchedule.findMany({
        where: {
          domainId,
          isDeleted: false,
          status: StatusEnum.ACTIVE,
          assetType: 'MACHINERY',
          scheduleStatus: 'SCHEDULED',
          nextDueDate: { gte: new Date() },
          machineryId: { in: machineIds },
        },
        select: {
          code: true,
          title: true,
          nextDueDate: true,
          scheduleStatus: true,
          machinery: {
            select: {
              id: true,
              code: true,
              type: true,
              project: {
                select: {
                  code: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { nextDueDate: 'asc' },
        take: 5,
      }),
    ]);

  const machineDetails = await getMachineIdentities(domainId, [
    ...workingHourRows.flatMap((row) =>
      row.machineryId ? [row.machineryId] : [],
    ),
    ...maintenanceRows.flatMap((row) =>
      row.machineryId ? [row.machineryId] : [],
    ),
    ...movementRows.flatMap((row) =>
      row.machineryId ? [row.machineryId] : [],
    ),
  ]);

  return {
    topWorkingHourMachines: workingHourRows.flatMap((row) => {
      if (!row.machineryId) return [];
      const machine = machineDetails.get(row.machineryId);
      if (!machine) return [];

      return [
        {
          ...machineSummaryBase(machine, language),
          totalWorkingHours: roundToTwo(row._sum.hoursRun ?? 0),
        },
      ];
    }),
    topMaintenanceMachines: maintenanceRows.flatMap((row) => {
      if (!row.machineryId) return [];
      const machine = machineDetails.get(row.machineryId);
      if (!machine) return [];

      return [
        {
          ...machineSummaryBase(machine, language),
          maintenanceCount: row._count.machineryId,
        },
      ];
    }),
    topMovementMachines: movementRows.flatMap((row) => {
      if (!row.machineryId) return [];
      const machine = machineDetails.get(row.machineryId);
      if (!machine) return [];

      return [
        {
          ...machineSummaryBase(machine, language),
          movementCount: row._count.machineryId,
        },
      ];
    }),
    upcomingSchedules: upcomingSchedules.flatMap((schedule) => {
      if (!schedule.machinery) return [];

      return [
        {
          ...machineSummaryBase(schedule.machinery, language),
          scheduleCode: schedule.code,
          scheduleTitle: getLocalizedText(schedule.title, language),
          nextDueDate: schedule.nextDueDate,
          scheduleStatus: schedule.scheduleStatus,
        },
      ];
    }),
  };
}

async function getMachineWorkbookWorksheets(
  domainId: string,
  filters: MachineSummaryExportFilters,
  language: string | null,
): Promise<ReportWorkbookWorksheet[]> {
  const report = await getMachineSummaryReport(domainId, filters, language);
  const [vehicles, maintenanceSchedules, maintenanceLogs, movementLogs] =
    await Promise.all([
      prisma.vehicle.findMany({
        where: {
          domainId,
          isDeleted: false,
          ...(filters.vehicleId ? { id: filters.vehicleId } : {}),
        },
        select: {
          numberPlate: true,
          vehicleType: true,
          loadCapacity: true,
          loadCapacityUomId: true,
          alertLoadThreshold: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.maintenanceSchedule.findMany({
        where: {
          domainId,
          isDeleted: false,
          ...(filters.vehicleId ? { vehicleId: filters.vehicleId } : {}),
          ...(filters.machineryId ? { machineryId: filters.machineryId } : {}),
          ...(filters.projectId
            ? {
                machinery: {
                  is: {
                    projectId: filters.projectId,
                  },
                },
              }
            : {}),
        },
        select: {
          code: true,
          title: true,
          assetType: true,
          nextDueDate: true,
          scheduleStatus: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          vehicle: {
            select: {
              numberPlate: true,
              vehicleType: true,
            },
          },
          machinery: {
            select: {
              code: true,
              type: true,
              project: {
                select: {
                  code: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { nextDueDate: 'asc' },
      }),
      prisma.maintenanceLog.findMany({
        where: {
          domainId,
          isDeleted: false,
          ...(filters.vehicleId ? { vehicleId: filters.vehicleId } : {}),
          ...(filters.machineryId ? { machineryId: filters.machineryId } : {}),
          ...(filters.projectId
            ? {
                machinery: {
                  is: {
                    projectId: filters.projectId,
                  },
                },
              }
            : {}),
        },
        select: {
          code: true,
          date: true,
          description: true,
          assetType: true,
          expenseAmount: true,
          meterReading: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          vehicle: {
            select: {
              numberPlate: true,
              vehicleType: true,
            },
          },
          machinery: {
            select: {
              code: true,
              type: true,
            },
          },
          maintenanceSchedule: {
            select: {
              code: true,
              title: true,
              scheduleStatus: true,
            },
          },
        },
        orderBy: { date: 'desc' },
      }),
      prisma.movementLog.findMany({
        where: {
          domainId,
          isDeleted: false,
          ...(filters.vehicleId ? { vehicleId: filters.vehicleId } : {}),
          ...(filters.machineryId ? { machineryId: filters.machineryId } : {}),
          ...(filters.projectId ? { projectId: filters.projectId } : {}),
        },
        select: {
          code: true,
          movementType: true,
          assetType: true,
          fromLocation: true,
          toLocation: true,
          startDateTime: true,
          endDateTime: true,
          hours: true,
          startMeterReading: true,
          endMeterReading: true,
          meterUsage: true,
          notes: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          vehicle: {
            select: {
              numberPlate: true,
              vehicleType: true,
            },
          },
          machinery: {
            select: {
              code: true,
              type: true,
            },
          },
          project: {
            select: {
              code: true,
              name: true,
            },
          },
        },
        orderBy: { startDateTime: 'desc' },
      }),
    ]);

  const vehicleRows = vehicles.map((vehicle) => ({
    numberPlate: vehicle.numberPlate,
    vehicleType: vehicle.vehicleType,
    loadCapacity: vehicle.loadCapacity,
    loadCapacityUomId: vehicle.loadCapacityUomId,
    alertLoadThreshold: vehicle.alertLoadThreshold,
    status: vehicle.status,
    createdAt: vehicle.createdAt,
    updatedAt: vehicle.updatedAt,
  }));

  const maintenanceScheduleRows = maintenanceSchedules.map((schedule) => ({
    scheduleCode: schedule.code,
    scheduleTitle: getLocalizedText(schedule.title, language),
    assetType: schedule.assetType,
    vehicleNumberPlate: schedule.vehicle?.numberPlate ?? '',
    vehicleType: schedule.vehicle?.vehicleType ?? '',
    machineCode: schedule.machinery?.code ?? '',
    machineType: schedule.machinery
      ? getLocalizedText(schedule.machinery.type, language)
      : '',
    projectCode: schedule.machinery?.project.code ?? '',
    projectName: schedule.machinery
      ? getLocalizedText(schedule.machinery.project.name, language)
      : '',
    nextDueDate: schedule.nextDueDate,
    scheduleStatus: schedule.scheduleStatus,
    status: schedule.status,
    createdAt: schedule.createdAt,
    updatedAt: schedule.updatedAt,
  }));

  const maintenanceLogRows = maintenanceLogs.map((log) => ({
    maintenanceCode: log.code,
    date: log.date,
    description: normalizeDescription(log.description, language),
    assetType: log.assetType,
    vehicleNumberPlate: log.vehicle?.numberPlate ?? '',
    vehicleType: log.vehicle?.vehicleType ?? '',
    machineCode: log.machinery?.code ?? '',
    machineType: log.machinery
      ? getLocalizedText(log.machinery.type, language)
      : '',
    scheduleCode: log.maintenanceSchedule?.code ?? '',
    scheduleTitle: log.maintenanceSchedule
      ? getLocalizedText(log.maintenanceSchedule.title, language)
      : '',
    scheduleStatus: log.maintenanceSchedule?.scheduleStatus ?? '',
    expenseAmount: toNumber(log.expenseAmount),
    meterReading: log.meterReading,
    status: log.status,
    createdAt: log.createdAt,
    updatedAt: log.updatedAt,
  }));

  const movementLogRows = movementLogs.map((log) => ({
    movementCode: log.code,
    movementType: log.movementType,
    assetType: log.assetType,
    vehicleNumberPlate: log.vehicle?.numberPlate ?? '',
    vehicleType: log.vehicle?.vehicleType ?? '',
    machineCode: log.machinery?.code ?? '',
    machineType: log.machinery
      ? getLocalizedText(log.machinery.type, language)
      : '',
    projectCode: log.project?.code ?? '',
    projectName: log.project
      ? getLocalizedText(log.project.name, language)
      : '',
    fromLocation: log.fromLocation,
    toLocation: log.toLocation,
    startDateTime: log.startDateTime,
    endDateTime: log.endDateTime,
    hours: log.hours,
    startMeterReading: log.startMeterReading,
    endMeterReading: log.endMeterReading,
    meterUsage: log.meterUsage,
    notes: log.notes,
    status: log.status,
    createdAt: log.createdAt,
    updatedAt: log.updatedAt,
  }));

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
    worksheet(
      'Vehicles',
      [
        'numberPlate',
        'vehicleType',
        'loadCapacity',
        'loadCapacityUomId',
        'alertLoadThreshold',
        'status',
        'createdAt',
        'updatedAt',
      ],
      vehicleRows,
    ),
    worksheet(
      'Maintenance Schedules',
      [
        'scheduleCode',
        'scheduleTitle',
        'assetType',
        'vehicleNumberPlate',
        'vehicleType',
        'machineCode',
        'machineType',
        'projectCode',
        'projectName',
        'nextDueDate',
        'scheduleStatus',
        'status',
        'createdAt',
        'updatedAt',
      ],
      maintenanceScheduleRows,
    ),
    worksheet(
      'Maintenance Logs',
      [
        'maintenanceCode',
        'date',
        'description',
        'assetType',
        'vehicleNumberPlate',
        'vehicleType',
        'machineCode',
        'machineType',
        'scheduleCode',
        'scheduleTitle',
        'scheduleStatus',
        'expenseAmount',
        'meterReading',
        'status',
        'createdAt',
        'updatedAt',
      ],
      maintenanceLogRows,
    ),
    worksheet(
      'Movement Logs',
      [
        'movementCode',
        'movementType',
        'assetType',
        'vehicleNumberPlate',
        'vehicleType',
        'machineCode',
        'machineType',
        'projectCode',
        'projectName',
        'fromLocation',
        'toLocation',
        'startDateTime',
        'endDateTime',
        'hours',
        'startMeterReading',
        'endMeterReading',
        'meterUsage',
        'notes',
        'status',
        'createdAt',
        'updatedAt',
      ],
      movementLogRows,
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

  getProjectUserTaskSummaryReport: async (
    domainId: string,
    filters: ProjectUserTaskFilters,
    language: string | null = null,
  ) => {
    try {
      return await getProjectUserTaskSummaryReport(domainId, filters, language);
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

  getMachineSummaryDashboardReport: async (
    domainId: string,
    filters: MachineSummaryFilters,
    language: string | null = null,
  ) => {
    try {
      return await getMachineSummaryDashboardReport(
        domainId,
        filters,
        language,
      );
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  getMachineWorkbookWorksheets: async (
    domainId: string,
    filters: MachineSummaryExportFilters,
    language: string | null = null,
  ): Promise<ReportWorkbookWorksheet[]> => {
    try {
      return await getMachineWorkbookWorksheets(domainId, filters, language);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },
};
