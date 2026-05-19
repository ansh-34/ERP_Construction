import {
  projectRepository,
  projectStageRepository,
  projectTaskRepository,
  UserRepository,
  type ProjectTaskRecord,
  type UpdateProjectTaskInput as RepositoryUpdateProjectTaskInput,
} from '@repositories/index';
import { StatusEnum } from '@constants/index';
import { normalizePrismaError } from '@/utils/prismaError';
import { normalizePagination, type PaginationQuery } from '@/utils/pagination';
import {
  isNonEmptyString,
  isNonNegativeFiniteNumber,
  isPlainObject,
} from '@/utils/validation';

export interface CreateProjectTaskInput {
  name: Record<string, unknown>;
  assignee?: string | null;
  plannedStartDate?: string | null;
  plannedEndDate?: string | null;
  actualStartDate?: string | null;
  actualEndDate?: string | null;
  taskStatus?: string;
  taskProgress?: number;
  totalDelayInDays?: number;
  requiredApproval?: boolean;
  lastApprovedDeadline?: string | null;
  projectBatchCode?: string | null;
  stageId: string;
  projectId: string;
  domainId: string;
  adminId: string;
  status: StatusEnum;
}

export interface UpdateProjectTaskInput {
  name?: Record<string, unknown>;
  assignee?: string | null;
  plannedStartDate?: string | null;
  plannedEndDate?: string | null;
  actualStartDate?: string | null;
  actualEndDate?: string | null;
  taskStatus?: string;
  taskProgress?: number;
  totalDelayInDays?: number;
  requiredApproval?: boolean;
  lastApprovedDeadline?: string | null;
  projectBatchCode?: string | null;
  status?: StatusEnum;
}

type LocalizedProjectTaskRecord = Omit<
  ProjectTaskRecord,
  'name' | 'assignee'
> & {
  name: string;
  assignee: string | null;
};

type PaginatedProjectTasks = {
  projectTasks: LocalizedProjectTaskRecord[];
  pagination: {
    totalCount: number;
    offset: number;
    limit: number;
  };
};

type ProjectTaskApprovalState = 'APPROVED' | 'REJECTED';

function buildProjectTaskCode(name: Record<string, unknown>): string {
  return name.en?.toString().toUpperCase().replace(/\s+/g, '_') || '';
}

function buildProjectTaskSearchText(name: Record<string, unknown>): string {
  return Object.values(name).join(' ').toLowerCase();
}

function getLocalizedText(
  value: Record<string, unknown>,
  language: string | null,
): string {
  const langCode = language || 'en';
  const localizedValue = value[langCode] ?? value.en ?? '';

  return typeof localizedValue === 'string'
    ? localizedValue
    : String(localizedValue);
}

function getAssigneeUserId(
  value: Record<string, unknown> | null,
): string | null {
  if (!value) {
    return null;
  }

  return typeof value.userId === 'string' ? value.userId : null;
}

function normalizeProjectTask(
  task: ProjectTaskRecord,
  language: string | null,
): LocalizedProjectTaskRecord {
  return {
    ...task,
    name: getLocalizedText(task.name, language),
    assignee: getAssigneeUserId(task.assignee),
  };
}

function parseOptionalDate(value: string | null | undefined): Date | null {
  if (value === null || value === undefined) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error('invalid date');
  }

  return date;
}

function assertStatus(status: StatusEnum | undefined): void {
  if (
    status !== undefined &&
    status !== StatusEnum.ACTIVE &&
    status !== StatusEnum.INACTIVE
  ) {
    throw new Error('invalid status');
  }
}

function assertTaskString(
  value: string | null | undefined,
  field: string,
): void {
  if (value !== undefined && value !== null && !isNonEmptyString(value)) {
    throw new Error(`invalid ${field}`);
  }
}

function assertCreateInput(data: CreateProjectTaskInput): void {
  if (!isPlainObject(data.name) || Object.keys(data.name).length === 0) {
    throw new Error('invalid json name');
  }

  if (!isNonEmptyString(data.name.en)) {
    throw new Error('name.en is required');
  }

  if (
    data.assignee !== undefined &&
    data.assignee !== null &&
    !isNonEmptyString(data.assignee)
  ) {
    throw new Error('invalid assignee');
  }

  assertTaskString(data.taskStatus, 'taskStatus');
  assertTaskString(data.projectBatchCode, 'projectBatchCode');

  if (
    data.taskProgress !== undefined &&
    !isNonNegativeFiniteNumber(data.taskProgress)
  ) {
    throw new Error('invalid taskProgress');
  }

  if (
    data.totalDelayInDays !== undefined &&
    !isNonNegativeFiniteNumber(data.totalDelayInDays)
  ) {
    throw new Error('invalid totalDelayInDays');
  }

  if (!isNonEmptyString(data.stageId)) {
    throw new Error('invalid stageId');
  }

  if (!isNonEmptyString(data.projectId)) {
    throw new Error('invalid projectId');
  }

  if (!isNonEmptyString(data.domainId)) {
    throw new Error('invalid domainId');
  }

  assertStatus(data.status);
}

function assertUpdateInput(data: UpdateProjectTaskInput): void {
  const hasAnyField = Object.values(data).some((value) => value !== undefined);

  if (!hasAnyField) {
    throw new Error('empty update payload');
  }

  if (data.name !== undefined && !isPlainObject(data.name)) {
    throw new Error('invalid json name');
  }

  if (data.name !== undefined && !isNonEmptyString(data.name.en)) {
    throw new Error('name.en is required');
  }

  if (
    data.assignee !== undefined &&
    data.assignee !== null &&
    !isNonEmptyString(data.assignee)
  ) {
    throw new Error('invalid assignee');
  }

  assertTaskString(data.taskStatus, 'taskStatus');
  assertTaskString(data.projectBatchCode, 'projectBatchCode');

  if (
    data.taskProgress !== undefined &&
    !isNonNegativeFiniteNumber(data.taskProgress)
  ) {
    throw new Error('invalid taskProgress');
  }

  if (
    data.totalDelayInDays !== undefined &&
    !isNonNegativeFiniteNumber(data.totalDelayInDays)
  ) {
    throw new Error('invalid totalDelayInDays');
  }

  assertStatus(data.status);
}

async function assertAssigneeExists(
  assignee: string | null | undefined,
  domainId: string,
): Promise<void> {
  if (assignee === undefined || assignee === null) {
    return;
  }

  const user = await UserRepository.findActiveByIdAndDomain(assignee, domainId);

  if (!user) {
    throw new Error('invalid assignee');
  }
}

function buildCreatePayload(data: CreateProjectTaskInput) {
  const code = buildProjectTaskCode(data.name);

  return {
    ...data,
    assignee: data.assignee ? { userId: data.assignee } : null,
    code,
    searchText: buildProjectTaskSearchText(data.name),
    plannedStartDate: parseOptionalDate(data.plannedStartDate),
    plannedEndDate: parseOptionalDate(data.plannedEndDate),
    actualStartDate: parseOptionalDate(data.actualStartDate),
    actualEndDate: parseOptionalDate(data.actualEndDate),
    lastApprovedDeadline: parseOptionalDate(data.lastApprovedDeadline),
  };
}

function buildUpdatePayload(
  data: UpdateProjectTaskInput,
  existingTask: ProjectTaskRecord,
): RepositoryUpdateProjectTaskInput {
  const code =
    data.name !== undefined
      ? buildProjectTaskCode(data.name)
      : existingTask.code;

  return {
    ...(data.name !== undefined && { name: data.name }),
    ...(data.name !== undefined && { code }),
    ...(data.name !== undefined && {
      searchText: buildProjectTaskSearchText(data.name),
    }),
    ...(data.assignee !== undefined && {
      assignee: data.assignee ? { userId: data.assignee } : null,
    }),
    ...(data.plannedStartDate !== undefined && {
      plannedStartDate: parseOptionalDate(data.plannedStartDate),
    }),
    ...(data.plannedEndDate !== undefined && {
      plannedEndDate: parseOptionalDate(data.plannedEndDate),
    }),
    ...(data.actualStartDate !== undefined && {
      actualStartDate: parseOptionalDate(data.actualStartDate),
    }),
    ...(data.actualEndDate !== undefined && {
      actualEndDate: parseOptionalDate(data.actualEndDate),
    }),
    ...(data.taskStatus !== undefined && { taskStatus: data.taskStatus }),
    ...(data.taskProgress !== undefined && {
      taskProgress: data.taskProgress,
    }),
    ...(data.totalDelayInDays !== undefined && {
      totalDelayInDays: data.totalDelayInDays,
    }),
    ...(data.requiredApproval !== undefined && {
      requiredApproval: data.requiredApproval,
    }),
    ...(data.lastApprovedDeadline !== undefined && {
      lastApprovedDeadline: parseOptionalDate(data.lastApprovedDeadline),
    }),
    ...(data.projectBatchCode !== undefined && {
      projectBatchCode: data.projectBatchCode,
    }),
    ...(data.status !== undefined && { status: data.status }),
  };
}

export const projectTaskService = {
  create: async (
    data: CreateProjectTaskInput,
    language: string | null = null,
  ): Promise<LocalizedProjectTaskRecord> => {
    assertCreateInput(data);

    try {
      const project = await projectRepository.findById(
        data.projectId,
        data.domainId,
        data.adminId,
      );

      if (!project) {
        throw new Error('not found');
      }

      const stage = await projectStageRepository.findById(
        data.stageId,
        data.domainId,
        data.adminId,
      );

      if (!stage || stage.projectId !== data.projectId) {
        throw new Error('not found');
      }

      await assertAssigneeExists(data.assignee, data.domainId);

      const createPayload = buildCreatePayload(data);

      if (
        await projectTaskRepository.findByCode(
          createPayload.code,
          data.domainId,
          data.projectId,
          data.stageId,
          data.adminId,
        )
      ) {
        throw new Error('duplicate code');
      }

      const task = await projectTaskRepository.create(createPayload);

      return normalizeProjectTask(task, language);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  getAll: async (
    domainId: string,
    adminId: string,
    projectId?: string,
    stageId?: string,
    searchKey?: string,
    paginationQuery: PaginationQuery = {},
    language: string | null = null,
  ): Promise<PaginatedProjectTasks> => {
    if (!isNonEmptyString(domainId)) {
      throw new Error('invalid domainId');
    }

    if (projectId !== undefined && !isNonEmptyString(projectId)) {
      throw new Error('invalid projectId');
    }

    if (stageId !== undefined && !isNonEmptyString(stageId)) {
      throw new Error('invalid stageId');
    }

    try {
      const { offset, limit } = normalizePagination(paginationQuery);
      const tasks = await projectTaskRepository.findMany(
        domainId,
        adminId,
        projectId,
        stageId,
        searchKey,
      );
      const paginatedTasks = tasks.slice(offset, offset + limit);

      return {
        projectTasks: paginatedTasks.map((task) =>
          normalizeProjectTask(task, language),
        ),
        pagination: {
          totalCount: tasks.length,
          offset,
          limit,
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
  ): Promise<LocalizedProjectTaskRecord | null> => {
    if (!isNonEmptyString(id) || !isNonEmptyString(domainId)) {
      throw new Error('invalid ids');
    }

    try {
      const task = await projectTaskRepository.findById(id, domainId, adminId);
      return task ? normalizeProjectTask(task, language) : null;
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  update: async (
    id: string,
    domainId: string,
    adminId: string,
    data: UpdateProjectTaskInput,
    language: string | null = null,
  ): Promise<LocalizedProjectTaskRecord | null> => {
    if (!isNonEmptyString(id) || !isNonEmptyString(domainId)) {
      throw new Error('invalid ids');
    }

    assertUpdateInput(data);

    try {
      const existingTask = await projectTaskRepository.findById(
        id,
        domainId,
        adminId,
      );

      if (!existingTask) {
        throw new Error('not found');
      }

      await assertAssigneeExists(data.assignee, domainId);

      const updatePayload = buildUpdatePayload(data, existingTask);

      if (updatePayload.code && updatePayload.code !== existingTask.code) {
        const duplicateTask = await projectTaskRepository.findByCode(
          updatePayload.code,
          domainId,
          existingTask.projectId,
          existingTask.stageId,
          adminId,
        );

        if (duplicateTask && duplicateTask.id !== id) {
          throw new Error('duplicate code');
        }
      }

      const task = await projectTaskRepository.update(
        id,
        domainId,
        updatePayload,
        adminId,
      );

      return task ? normalizeProjectTask(task, language) : null;
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  approveOrReject: async (
    ids: string | string[],
    domainId: string,
    adminId: string,
    approvalState: ProjectTaskApprovalState,
    language: string | null = null,
  ): Promise<LocalizedProjectTaskRecord[]> => {
    const idArray = Array.isArray(ids) ? ids : [ids];

    if (!idArray.length || idArray.some((id) => !isNonEmptyString(id))) {
      throw new Error('invalid ids');
    }

    if (!isNonEmptyString(domainId)) {
      throw new Error('invalid domainId');
    }

    try {
      const existingTasks = [];

      for (const id of idArray) {
        const task = await projectTaskRepository.findById(
          id,
          domainId,
          adminId,
        );

        if (!task) {
          throw new Error('not found');
        }

        if (task.taskStatus === 'APPROVED' || task.taskStatus === 'REJECTED') {
          throw new Error('request already actioned');
        }

        if (task.taskStatus !== 'COMPLETED') {
          throw new Error('task not completed');
        }

        existingTasks.push(task);
      }

      const updatedTasks = [];

      for (const task of existingTasks) {
        const updatedTask = await projectTaskRepository.update(
          task.id,
          domainId,
          {
            taskStatus: approvalState,
            requiredApproval: false,
          },
          adminId,
        );

        if (updatedTask) {
          updatedTasks.push(normalizeProjectTask(updatedTask, language));
        }
      }

      return updatedTasks;
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  softDelete: async (
    id: string,
    domainId: string,
    adminId: string,
  ): Promise<ProjectTaskRecord | null> => {
    if (!isNonEmptyString(id) || !isNonEmptyString(domainId)) {
      throw new Error('invalid ids');
    }

    try {
      const existingTask = await projectTaskRepository.findById(
        id,
        domainId,
        adminId,
      );

      if (!existingTask) {
        throw new Error('not found');
      }

      return await projectTaskRepository.softDelete(id, domainId, adminId);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },
};
