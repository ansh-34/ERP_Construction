import {
  projectRepository,
  DomainRepository,
  projectStageRepository,
  projectTaskDelayRepository,
  projectTaskImageRepository,
  projectTaskRepository,
  mediaRepository,
  UserRepository,
  type ProjectRecord,
  type ProjectStageRecord,
  type ProjectTaskDelayRecord,
  type ProjectTaskImageRecord,
  type ProjectTaskRecord,
} from '@repositories/index';
import { StatusEnum } from '@constants/index';
import prisma from '@/infra/database/prisma/prisma.client';
import { transaction } from '@/infra/database/prisma/transaction.js';
import { normalizePrismaError } from '@/utils/prismaError';
import { normalizePagination, type PaginationQuery } from '@/utils/pagination';
import {
  isNonEmptyString,
  isPlainObject,
  isNonNegativeFiniteNumber,
} from '@/utils/validation';

interface CreateProjectStageInProjectInput {
  name: Record<string, unknown>;
  description?: string | null;
  progress?: number | null;
  expectedStartDate?: string;
  expectedEndDate?: string;
  status?: StatusEnum;
}

export interface CreateProjectInput {
  name: Record<string, unknown>;
  description?: string | null;
  budget: number;
  spent?: number;
  expectedStartDate?: string;
  expectedEndDate?: string;
  locationId: string;
  domainId: string;
  adminId: string;
  status: StatusEnum;
  projectStages?: CreateProjectStageInProjectInput[];
}

type LocalizedText = string | Record<string, unknown>;

type LocalizedProjectRecord = Omit<ProjectRecord, 'name' | 'description'> & {
  name: LocalizedText;
  description: LocalizedText | null;
};

type LocalizedProjectStageRecord = Omit<
  ProjectStageRecord,
  'name' | 'description'
> & {
  name: LocalizedText;
  description: LocalizedText | null;
};

type LocalizedProjectWithStagesRecord = LocalizedProjectRecord & {
  projectStages?: LocalizedProjectStageRecord[];
};

type PaginatedProjects = {
  projects: LocalizedProjectRecord[];
  pagination: {
    totalCount: number;
    offset: number;
    limit: number;
  };
};

type ProjectAnalytics = {
  projectCounts: {
    total: number;
    inProgress: number;
    completed: number;
  };
  budget: {
    total: number;
    spent: number;
  };
  inProgressProjectAnalytics: {
    taskDelayCount: number;
    taskDelayDuration: number;
    taskSubmissionCount: number;
    taskApprovalCount: number;
  };
};

type ApprovalAction = 'APPROVED' | 'REJECTED' | 'APPROVAL' | 'REJECTION';
type NormalizedApprovalState = 'APPROVED' | 'REJECTED';
type SubmissionApprovalState = 'PENDING' | NormalizedApprovalState;

type TaskSubmissionImageInput = {
  imageId: string;
  description?: string | null;
};

type LocalizedTaskSubmissionRecord = Omit<
  ProjectTaskRecord,
  'name' | 'assignee' | 'stage' | 'project' | 'domain' | 'admin'
> & {
  name: LocalizedText;
  assignee: string | null;
  approvalState: SubmissionApprovalState;
  images?: ProjectTaskImageRecord[];
};

type PaginatedTaskSubmissions = {
  taskSubmissions: LocalizedTaskSubmissionRecord[];
  pagination: {
    totalCount: number;
    offset: number;
    limit: number;
  };
};

function buildProjectCode(name: Record<string, unknown>): string {
  return name.en?.toString().toUpperCase().replace(/\s+/g, '_') || '';
}

function buildProjectSearchText(name: Record<string, unknown>): string {
  return Object.values(name).join(' ').toLowerCase();
}

function buildProjectStageCode(name: Record<string, unknown>): string {
  return name.en?.toString().toUpperCase().replace(/\s+/g, '_') || '';
}

function buildProjectStageSearchText(name: Record<string, unknown>): string {
  return Object.values(name).join(' ').toLowerCase();
}

function toNumber(value: unknown): number {
  if (value === null || value === undefined) {
    return 0;
  }

  return Number(value);
}

function getLocalizedText(
  value: Record<string, unknown> | null,
  language: string | null,
): LocalizedText | null {
  if (!value) {
    return null;
  }

  if (!language) {
    return value;
  }

  const localizedValue = value[language] ?? value.en ?? '';

  return typeof localizedValue === 'string'
    ? localizedValue
    : String(localizedValue);
}

function getTaskAssigneeUserId(
  value: Record<string, unknown> | null,
): string | null {
  if (!value) {
    return null;
  }

  return typeof value.userId === 'string' ? value.userId : null;
}

function normalizeApprovalAction(
  action: ApprovalAction,
): NormalizedApprovalState {
  return action === 'APPROVED' || action === 'APPROVAL'
    ? 'APPROVED'
    : 'REJECTED';
}

function getSubmissionApprovalState(
  task: ProjectTaskRecord,
): SubmissionApprovalState {
  if (task.taskStatus === 'APPROVED') {
    return 'APPROVED';
  }

  if (task.taskStatus === 'REJECTED') {
    return 'REJECTED';
  }

  return 'PENDING';
}

function normalizeTaskSubmission(
  task: ProjectTaskRecord,
  language: string | null,
  images?: ProjectTaskImageRecord[],
): LocalizedTaskSubmissionRecord {
  const taskData = { ...task };
  delete taskData.stage;
  delete taskData.project;
  delete taskData.domain;
  delete taskData.admin;

  return {
    ...taskData,
    name: getLocalizedText(task.name, language) || '',
    assignee: getTaskAssigneeUserId(task.assignee),
    approvalState: getSubmissionApprovalState(task),
    ...(images !== undefined && { images }),
  };
}

function assertTaskSubmissionImages(images: TaskSubmissionImageInput[]): void {
  for (const image of images) {
    if (!isNonEmptyString(image.imageId)) {
      throw new Error('invalid imageId');
    }

    if (image.description !== undefined && image.description !== null) {
      if (!isNonEmptyString(image.description)) {
        throw new Error('description is required');
      }

      if (/[\r\n]/.test(image.description)) {
        throw new Error('description must be single-line');
      }
    }
  }
}

function normalizeDescription(
  value: unknown,
  language: string | null,
): LocalizedText | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (isPlainObject(value)) {
    return getLocalizedText(value, language);
  }

  if (typeof value !== 'string') {
    return String(value);
  }

  try {
    const parsed = JSON.parse(value) as unknown;

    if (isPlainObject(parsed)) {
      return getLocalizedText(parsed, language);
    }
  } catch {
    // Value is already a plain single-line description.
  }

  return value;
}

export interface UpdateProjectInput {
  name?: Record<string, unknown>;
  description?: string | null;
  budget?: number;
  spent?: number;
  actualStartDate?: string | null;
  actualEndDate?: string | null;
  locationId?: string;
  status?: StatusEnum;
}

function parseOptionalDate(
  value: string | Date | null | undefined,
  field: string,
): Date | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      throw new Error(`invalid ${field}`);
    }

    return value;
  }

  if (!isNonEmptyString(value)) {
    throw new Error(`invalid ${field}`);
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`invalid ${field}`);
  }

  return date;
}

function ensureDateRange(
  startDate: Date | null | undefined,
  endDate: Date | null | undefined,
  startField: string,
  endField: string,
): void {
  if (startDate && endDate && endDate.getTime() < startDate.getTime()) {
    throw new Error(`${endField} cannot be before ${startField}`);
  }
}

function ensureDateWithinProjectRange(
  stageStartDate: Date | null | undefined,
  stageEndDate: Date | null | undefined,
  projectStartDate: Date | null | undefined,
  projectEndDate: Date | null | undefined,
): void {
  if (
    stageStartDate &&
    projectStartDate &&
    stageStartDate.getTime() < projectStartDate.getTime()
  ) {
    throw new Error(
      'project stage expectedStartDate cannot be before project expectedStartDate',
    );
  }

  if (
    stageEndDate &&
    projectEndDate &&
    stageEndDate.getTime() > projectEndDate.getTime()
  ) {
    throw new Error(
      'project stage expectedEndDate cannot be after project expectedEndDate',
    );
  }
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function getApprovedDelayTaskUpdate(
  task: ProjectTaskRecord,
  requestedDelayInDays: number,
): Pick<ProjectTaskRecord, 'totalDelayInDays' | 'lastApprovedDeadline'> {
  const currentDeadline = task.lastApprovedDeadline ?? task.plannedEndDate;

  if (!currentDeadline) {
    throw new Error('task plannedEndDate is required');
  }

  return {
    totalDelayInDays: (task.totalDelayInDays ?? 0) + requestedDelayInDays,
    lastApprovedDeadline: addDays(currentDeadline, requestedDelayInDays),
  };
}

function assertSingleLineDescription(
  value: string | null | undefined,
  field: string,
): void {
  if (value === undefined || value === null) {
    return;
  }

  if (!isNonEmptyString(value)) {
    throw new Error(`${field} is required`);
  }

  if (/[\r\n]/.test(value)) {
    throw new Error(`${field} must be single-line`);
  }
}

function normalizeProject(
  project: ProjectRecord,
  language: string | null,
): LocalizedProjectRecord {
  return {
    ...project,
    name: getLocalizedText(project.name, language) || '',
    description: normalizeDescription(project.description, language),
    location: normalizeRelationDetails(project.location, language),
    domain: normalizeRelationDetails(project.domain, language),
    admin: normalizeRelationDetails(project.admin, language),
  };
}

function normalizeRelationDetails(
  relation: ProjectRecord['location'],
  language: string | null,
): Record<string, unknown> | null | undefined {
  if (!relation) {
    return relation;
  }

  const name = relation.name;

  return {
    ...relation,
    name: isPlainObject(name) ? getLocalizedText(name, language) || '' : name,
  };
}

function normalizeProjectStage(
  stage: ProjectStageRecord,
  language: string | null,
): LocalizedProjectStageRecord {
  return {
    ...stage,
    name: getLocalizedText(stage.name, language) || '',
    description: normalizeDescription(stage.description, language),
  };
}

function assertCreateInput(data: CreateProjectInput): void {
  if (!isPlainObject(data.name)) {
    throw new Error('invalid json name');
  }

  if (!isNonEmptyString(data.name.en)) {
    throw new Error('name.en is required');
  }

  assertSingleLineDescription(data.description, 'description');

  if (!isNonNegativeFiniteNumber(data.budget)) {
    throw new Error('invalid budget');
  }

  if (!isNonEmptyString(data.locationId)) {
    throw new Error('invalid locationId');
  }

  ensureDateRange(
    parseOptionalDate(data.expectedStartDate, 'expectedStartDate'),
    parseOptionalDate(data.expectedEndDate, 'expectedEndDate'),
    'expectedStartDate',
    'expectedEndDate',
  );
  const projectExpectedStartDate = parseOptionalDate(
    data.expectedStartDate,
    'expectedStartDate',
  );
  const projectExpectedEndDate = parseOptionalDate(
    data.expectedEndDate,
    'expectedEndDate',
  );

  if (!isNonEmptyString(data.domainId)) {
    throw new Error('invalid domainId');
  }

  if (data.projectStages !== undefined) {
    if (!Array.isArray(data.projectStages)) {
      throw new Error('invalid projectStages');
    }

    const stageCodes = new Set<string>();

    data.projectStages.forEach((stage) => {
      if (!isPlainObject(stage.name)) {
        throw new Error('invalid project stage json name');
      }

      if (!isNonEmptyString(stage.name.en)) {
        throw new Error('project stage name.en is required');
      }

      assertSingleLineDescription(
        stage.description,
        'project stage description',
      );

      if (
        stage.progress !== undefined &&
        stage.progress !== null &&
        !isNonNegativeFiniteNumber(stage.progress)
      ) {
        throw new Error('invalid project stage progress');
      }

      if (
        stage.status !== undefined &&
        stage.status !== StatusEnum.ACTIVE &&
        stage.status !== StatusEnum.INACTIVE
      ) {
        throw new Error('invalid project stage status');
      }

      const stageExpectedStartDate = parseOptionalDate(
        stage.expectedStartDate,
        'project stage expectedStartDate',
      );
      const stageExpectedEndDate = parseOptionalDate(
        stage.expectedEndDate,
        'project stage expectedEndDate',
      );

      ensureDateRange(
        stageExpectedStartDate,
        stageExpectedEndDate,
        'project stage expectedStartDate',
        'project stage expectedEndDate',
      );
      ensureDateWithinProjectRange(
        stageExpectedStartDate,
        stageExpectedEndDate,
        projectExpectedStartDate,
        projectExpectedEndDate,
      );

      const code = buildProjectStageCode(stage.name);
      if (stageCodes.has(code)) {
        throw new Error('duplicate project stage code');
      }
      stageCodes.add(code);
    });
  }
}

function assertUpdateInput(data: UpdateProjectInput): void {
  const hasName = data.name !== undefined;
  const hasDescription = data.description !== undefined;
  const hasBudget = data.budget !== undefined;
  const hasSpent = data.spent !== undefined;
  const hasActualStartDate = data.actualStartDate !== undefined;
  const hasActualEndDate = data.actualEndDate !== undefined;
  const hasLocationId = data.locationId !== undefined;
  const hasStatus = data.status !== undefined;

  if (
    !hasName &&
    !hasDescription &&
    !hasBudget &&
    !hasSpent &&
    !hasActualStartDate &&
    !hasActualEndDate &&
    !hasLocationId &&
    !hasStatus
  ) {
    throw new Error('empty update payload');
  }

  if (hasName && !isPlainObject(data.name)) {
    throw new Error('invalid json name');
  }

  if (hasName && !isNonEmptyString(data.name?.en)) {
    throw new Error('name.en is required');
  }

  if (hasDescription) {
    assertSingleLineDescription(data.description, 'description');
  }

  if (hasBudget && !isNonNegativeFiniteNumber(data.budget as number)) {
    throw new Error('invalid budget');
  }

  if (hasSpent && !isNonNegativeFiniteNumber(data.spent as number)) {
    throw new Error('invalid spent');
  }

  if (hasLocationId && !isNonEmptyString(data.locationId)) {
    throw new Error('invalid locationId');
  }

  ensureDateRange(
    parseOptionalDate(data.actualStartDate, 'actualStartDate'),
    parseOptionalDate(data.actualEndDate, 'actualEndDate'),
    'actualStartDate',
    'actualEndDate',
  );
}

async function resolveAdminId(domainId: string, adminId: string) {
  if (adminId) return adminId;

  const domain = await DomainRepository.findActiveById(domainId);
  if (!domain?.adminId) {
    throw new Error('invalid adminId');
  }

  return domain.adminId;
}

export const projectService = {
  create: async (
    data: CreateProjectInput,
    language: string | null = null,
  ): Promise<LocalizedProjectWithStagesRecord> => {
    assertCreateInput(data);

    try {
      const code = buildProjectCode(data.name);
      const adminId = await resolveAdminId(data.domainId, data.adminId);

      if (await projectRepository.findByCode(code, data.domainId, adminId)) {
        throw new Error('duplicate code');
      }

      const { project } = await transaction(async (tx) => {
        const createdProject = await projectRepository.create(
          {
            ...data,
            adminId,
            code,
            searchText: buildProjectSearchText(data.name),
            expectedStartDate: parseOptionalDate(
              data.expectedStartDate,
              'expectedStartDate',
            ),
            expectedEndDate: parseOptionalDate(
              data.expectedEndDate,
              'expectedEndDate',
            ),
          },
          { transaction: tx },
        );

        if (data.projectStages?.length) {
          await projectStageRepository.bulkCreate(
            data.projectStages.map((stage) => ({
              name: stage.name,
              code: buildProjectStageCode(stage.name),
              searchText: buildProjectStageSearchText(stage.name),
              description: stage.description ?? null,
              progress: 0,
              expectedStartDate: parseOptionalDate(
                stage.expectedStartDate,
                'project stage expectedStartDate',
              ),
              expectedEndDate: parseOptionalDate(
                stage.expectedEndDate,
                'project stage expectedEndDate',
              ),
              projectId: createdProject.id,
              domainId: data.domainId,
              adminId,
              status: stage.status ?? StatusEnum.ACTIVE,
            })),
            { transaction: tx, skipDuplicates: false },
          );
        }

        return { project: createdProject };
      });

      const createdStages = data.projectStages?.length
        ? await projectStageRepository.findMany(
            data.domainId,
            project.id,
            adminId,
          )
        : [];

      return {
        ...normalizeProject(project, language),
        projectStages: createdStages.map((stage) =>
          normalizeProjectStage(stage, language),
        ),
      };
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  getAll: async (
    domainId: string,
    adminId: string,
    searchKey?: string,
    paginationQuery: PaginationQuery = {},
    language: string | null = null,
  ): Promise<PaginatedProjects> => {
    if (!isNonEmptyString(domainId)) {
      throw new Error('invalid domainId');
    }

    try {
      const { offset, limit } = normalizePagination(paginationQuery);
      const resolvedAdminId = await resolveAdminId(domainId, adminId);
      const projects = await projectRepository.findMany(
        domainId,
        searchKey,
        resolvedAdminId,
      );
      const paginatedProjects = projects.slice(offset, offset + limit);

      return {
        projects: paginatedProjects.map((project) =>
          normalizeProject(project, language),
        ),
        pagination: {
          totalCount: projects.length,
          offset,
          limit,
        },
      };
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  getAnalytics: async (
    domainId: string,
    adminId: string,
  ): Promise<ProjectAnalytics> => {
    if (!isNonEmptyString(domainId)) {
      throw new Error('invalid domainId');
    }

    if (!isNonEmptyString(adminId)) {
      throw new Error('invalid adminId');
    }

    try {
      const resolvedAdminId = await resolveAdminId(domainId, adminId);
      const baseProjectWhere = {
        domainId,
        adminId: resolvedAdminId,
        isDeleted: false,
      };
      const inProgressProjectWhere = {
        ...baseProjectWhere,
        actualStartDate: { not: null },
        actualEndDate: null,
      };
      const completedProjectWhere = {
        ...baseProjectWhere,
        actualEndDate: { not: null },
      };
      const inProgressProjectRelationWhere = {
        domainId,
        adminId: resolvedAdminId,
        isDeleted: false,
        actualStartDate: { not: null },
        actualEndDate: null,
      };

      const [
        totalProjects,
        inProgressProjects,
        completedProjects,
        budgetAggregate,
        taskDelayCount,
        taskDelayDurationAggregate,
        taskSubmissionCount,
        taskApprovalCount,
      ] = await Promise.all([
        prisma.project.count({ where: baseProjectWhere }),
        prisma.project.count({ where: inProgressProjectWhere }),
        prisma.project.count({ where: completedProjectWhere }),
        prisma.project.aggregate({
          where: baseProjectWhere,
          _sum: {
            budget: true,
            spent: true,
          },
        }),
        prisma.projectTaskDelay.count({
          where: {
            domainId,
            adminId: resolvedAdminId,
            isDeleted: false,
            project: inProgressProjectRelationWhere,
          },
        }),
        prisma.projectTaskDelay.aggregate({
          where: {
            domainId,
            adminId: resolvedAdminId,
            isDeleted: false,
            project: inProgressProjectRelationWhere,
          },
          _sum: {
            requestedDelayInDays: true,
          },
        }),
        prisma.projectTask.count({
          where: {
            domainId,
            adminId: resolvedAdminId,
            isDeleted: false,
            taskStatus: { in: ['COMPLETED', 'APPROVED', 'REJECTED'] },
            project: inProgressProjectRelationWhere,
          },
        }),
        prisma.projectTask.count({
          where: {
            domainId,
            adminId: resolvedAdminId,
            isDeleted: false,
            taskStatus: 'APPROVED',
            project: inProgressProjectRelationWhere,
          },
        }),
      ]);

      return {
        projectCounts: {
          total: totalProjects,
          inProgress: inProgressProjects,
          completed: completedProjects,
        },
        budget: {
          total: toNumber(budgetAggregate._sum.budget),
          spent: toNumber(budgetAggregate._sum.spent),
        },
        inProgressProjectAnalytics: {
          taskDelayCount,
          taskDelayDuration: toNumber(
            taskDelayDurationAggregate._sum.requestedDelayInDays,
          ),
          taskSubmissionCount,
          taskApprovalCount,
        },
      };
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  getById: async (
    id: string,
    domainId: string,
    adminId: string,
    language: string | null = null,
  ): Promise<LocalizedProjectRecord | null> => {
    if (!isNonEmptyString(id) || !isNonEmptyString(domainId)) {
      throw new Error('invalid ids');
    }

    try {
      const resolvedAdminId = await resolveAdminId(domainId, adminId);
      const project = await projectRepository.findById(
        id,
        domainId,
        resolvedAdminId,
      );
      return project ? normalizeProject(project, language) : null;
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  update: async (
    id: string,
    domainId: string,
    adminId: string,
    data: UpdateProjectInput,
    language: string | null = null,
  ): Promise<LocalizedProjectRecord | null> => {
    if (!isNonEmptyString(id) || !isNonEmptyString(domainId)) {
      throw new Error('invalid ids');
    }

    assertUpdateInput(data);

    try {
      const resolvedAdminId = await resolveAdminId(domainId, adminId);
      const existingProject = await projectRepository.findById(
        id,
        domainId,
        resolvedAdminId,
      );

      if (!existingProject) {
        throw new Error('not found');
      }

      const { actualStartDate, actualEndDate, ...projectData } = data;
      const updateData = {
        ...projectData,
        ...(actualStartDate !== undefined && {
          actualStartDate: parseOptionalDate(
            actualStartDate,
            'actualStartDate',
          ),
        }),
        ...(actualEndDate !== undefined && {
          actualEndDate: parseOptionalDate(actualEndDate, 'actualEndDate'),
        }),
        ...(data.name !== undefined
          ? {
              ...(data.name !== undefined && {
                code: buildProjectCode(data.name),
              }),
              searchText: buildProjectSearchText(data.name),
            }
          : {}),
      };

      if (updateData.code && updateData.code !== existingProject.code) {
        const duplicateProject = await projectRepository.findByCode(
          updateData.code,
          domainId,
          resolvedAdminId,
        );

        if (duplicateProject && duplicateProject.id !== id) {
          throw new Error('duplicate code');
        }
      }

      const project = await projectRepository.update(
        id,
        domainId,
        updateData,
        resolvedAdminId,
      );
      return project ? normalizeProject(project, language) : null;
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  submitTask: async (
    data: {
      taskId: string;
      userId: string;
      actualEndDate: string;
      taskProgress?: number;
      images?: TaskSubmissionImageInput[];
    },
    domainId: string,
    adminId: string,
    language: string | null = null,
  ): Promise<LocalizedTaskSubmissionRecord> => {
    if (
      !isNonEmptyString(data.taskId) ||
      !isNonEmptyString(data.userId) ||
      !isNonEmptyString(domainId)
    ) {
      throw new Error('invalid ids');
    }

    try {
      const resolvedAdminId = await resolveAdminId(domainId, adminId);
      const user = await UserRepository.findActiveByIdAndDomain(
        data.userId,
        domainId,
      );

      if (!user) {
        throw new Error('user not found');
      }

      const task = await projectTaskRepository.findById(
        data.taskId,
        domainId,
        resolvedAdminId,
      );

      if (!task) {
        throw new Error('not found');
      }

      if (getTaskAssigneeUserId(task.assignee) !== data.userId) {
        throw new Error('user is not assigned to this task');
      }

      const actualEndDate = parseOptionalDate(
        data.actualEndDate,
        'actualEndDate',
      );

      if (!actualEndDate) {
        throw new Error('invalid actualEndDate');
      }

      if (
        data.taskProgress !== undefined &&
        (!isNonNegativeFiniteNumber(data.taskProgress) ||
          data.taskProgress > 100)
      ) {
        throw new Error('invalid taskProgress');
      }

      const images = data.images ?? [];
      assertTaskSubmissionImages(images);

      const { updatedTask, createdImages } = await transaction(async (tx) => {
        const updatedTask = await projectTaskRepository.update(
          task.id,
          domainId,
          {
            actualEndDate,
            taskProgress: data.taskProgress ?? 100,
            taskStatus: 'COMPLETED',
            requiredApproval: true,
          },
          resolvedAdminId,
          { transaction: tx },
        );

        if (!updatedTask) {
          throw new Error('not found');
        }

        await projectStageRepository.recalculateProgress(
          updatedTask.stageId,
          domainId,
          resolvedAdminId,
          { transaction: tx },
        );

        const createdImages = await Promise.all(
          images.map(async (image) => {
            const media = await mediaRepository.findById(
              image.imageId,
              domainId,
              resolvedAdminId,
            );

            if (!media) {
              throw new Error('image not found');
            }

            return projectTaskImageRepository.create(
              {
                imageId: media.id,
                imageUrl: media.url,
                ...(image.description !== undefined && {
                  description: image.description,
                }),
                taskId: updatedTask.id,
                stageId: updatedTask.stageId,
                projectId: updatedTask.projectId,
                domainId,
                adminId: resolvedAdminId,
              },
              { transaction: tx },
            );
          }),
        );

        return { updatedTask, createdImages };
      });

      return normalizeTaskSubmission(updatedTask, language, createdImages);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  getTaskSubmissions: async (
    domainId: string,
    adminId: string,
    filters: {
      projectId?: string;
      stageId?: string;
      taskId?: string;
      userId?: string;
      approvalState?: SubmissionApprovalState;
      searchKey?: string;
    },
    paginationQuery: PaginationQuery = {},
    language: string | null = null,
  ): Promise<PaginatedTaskSubmissions> => {
    if (!isNonEmptyString(domainId)) {
      throw new Error('invalid domainId');
    }

    try {
      const resolvedAdminId = await resolveAdminId(domainId, adminId);
      const { offset, limit } = normalizePagination(paginationQuery);
      const tasks = await projectTaskRepository.findMany(
        domainId,
        resolvedAdminId,
        filters.projectId,
        filters.stageId,
        filters.searchKey,
      );
      const submittedTasks = tasks.filter((task) => {
        if (filters.taskId && task.id !== filters.taskId) {
          return false;
        }

        if (
          filters.userId &&
          getTaskAssigneeUserId(task.assignee) !== filters.userId
        ) {
          return false;
        }

        const approvalState = getSubmissionApprovalState(task);
        if (filters.approvalState && approvalState !== filters.approvalState) {
          return false;
        }

        return (
          task.requiredApproval === true ||
          task.taskStatus === 'COMPLETED' ||
          task.taskStatus === 'APPROVED' ||
          task.taskStatus === 'REJECTED'
        );
      });
      const paginatedTasks = submittedTasks.slice(offset, offset + limit);

      return {
        taskSubmissions: paginatedTasks.map((task) =>
          normalizeTaskSubmission(task, language),
        ),
        pagination: {
          totalCount: submittedTasks.length,
          offset,
          limit,
        },
      };
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  actionTaskSubmissions: async (
    ids: string | string[],
    action: ApprovalAction,
    domainId: string,
    adminId: string,
    language: string | null = null,
  ): Promise<LocalizedTaskSubmissionRecord[]> => {
    const idArray = Array.isArray(ids) ? ids : [ids];

    if (!idArray.length || idArray.some((id) => !isNonEmptyString(id))) {
      throw new Error('invalid ids');
    }

    try {
      const resolvedAdminId = await resolveAdminId(domainId, adminId);
      const approvalState = normalizeApprovalAction(action);
      const updatedTasks = await transaction(async (tx) => {
        const updatedTasks = [];

        for (const id of idArray) {
          const task = await projectTaskRepository.findById(
            id,
            domainId,
            resolvedAdminId,
          );

          if (!task) {
            throw new Error('not found');
          }

          if (
            task.taskStatus === 'APPROVED' ||
            task.taskStatus === 'REJECTED'
          ) {
            throw new Error('request already actioned');
          }

          if (
            task.taskStatus !== 'COMPLETED' &&
            task.requiredApproval !== true
          ) {
            throw new Error('task submission not pending approval');
          }

          const updatedTask = await projectTaskRepository.update(
            id,
            domainId,
            {
              taskStatus: approvalState,
              requiredApproval: false,
            },
            resolvedAdminId,
            { transaction: tx },
          );

          if (updatedTask) {
            await projectStageRepository.recalculateProgress(
              updatedTask.stageId,
              domainId,
              resolvedAdminId,
              { transaction: tx },
            );
            updatedTasks.push(normalizeTaskSubmission(updatedTask, language));
          }
        }

        return updatedTasks;
      });

      return updatedTasks;
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  actionTaskDelays: async (
    ids: string | string[],
    action: ApprovalAction,
    domainId: string,
    adminId: string,
  ): Promise<ProjectTaskDelayRecord[]> => {
    const idArray = Array.isArray(ids) ? ids : [ids];

    if (!idArray.length || idArray.some((id) => !isNonEmptyString(id))) {
      throw new Error('invalid ids');
    }

    try {
      const resolvedAdminId = await resolveAdminId(domainId, adminId);
      const approvalState = normalizeApprovalAction(action);
      const updatedDelays = await transaction(async (tx) => {
        const updatedDelays = [];

        for (const id of idArray) {
          const delay = await projectTaskDelayRepository.findById(
            id,
            domainId,
            resolvedAdminId,
          );

          if (!delay) {
            throw new Error('not found');
          }

          if (delay.requestApproved !== null) {
            throw new Error('request already actioned');
          }

          const task =
            approvalState === 'APPROVED'
              ? await projectTaskRepository.findById(
                  delay.taskId,
                  domainId,
                  resolvedAdminId,
                )
              : null;

          if (approvalState === 'APPROVED' && !task) {
            throw new Error('not found');
          }

          const taskDelayUpdate =
            approvalState === 'APPROVED' && task
              ? getApprovedDelayTaskUpdate(task, delay.requestedDelayInDays)
              : null;

          const updatedDelay = await projectTaskDelayRepository.update(
            id,
            domainId,
            {
              requestApproved: approvalState === 'APPROVED',
              requestApprovalTime: new Date(),
            },
            resolvedAdminId,
            { transaction: tx },
          );

          if (updatedDelay) {
            if (taskDelayUpdate) {
              await projectTaskRepository.update(
                updatedDelay.taskId,
                domainId,
                taskDelayUpdate,
                resolvedAdminId,
                { transaction: tx },
              );
            }

            updatedDelays.push(updatedDelay);
          }
        }

        return updatedDelays;
      });

      return updatedDelays;
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  softDelete: async (
    id: string,
    domainId: string,
    adminId: string,
  ): Promise<ProjectRecord | null> => {
    if (!isNonEmptyString(id) || !isNonEmptyString(domainId)) {
      throw new Error('invalid ids');
    }

    try {
      const resolvedAdminId = await resolveAdminId(domainId, adminId);
      const existingProject = await projectRepository.findById(
        id,
        domainId,
        resolvedAdminId,
      );

      if (!existingProject) {
        throw new Error('not found');
      }

      return await projectRepository.softDelete(id, domainId, resolvedAdminId);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },
};
