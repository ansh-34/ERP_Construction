import {
  projectRepository,
  projectStageRepository,
  projectTaskRepository,
  type ProjectTaskRecord,
  type UpdateProjectTaskInput as RepositoryUpdateProjectTaskInput,
} from '@repositories/index';
import { StatusEnum } from '@constants/index';
import { generateCode } from '@/utils/code';
import { normalizePrismaError } from '@/utils/prismaError';
import {
  isNonEmptyString,
  isNonNegativeFiniteNumber,
  isPlainObject,
} from '@/utils/validation';

export interface CreateProjectTaskInput {
  name: Record<string, unknown>;
  assignee?: Record<string, unknown> | null;
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
  status: StatusEnum;
}

export interface UpdateProjectTaskInput {
  name?: Record<string, unknown>;
  assignee?: Record<string, unknown> | null;
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

function assertTaskString(value: string | null | undefined, field: string): void {
  if (value !== undefined && value !== null && !isNonEmptyString(value)) {
    throw new Error(`invalid ${field}`);
  }
}

function assertCreateInput(data: CreateProjectTaskInput): void {
  if (!isPlainObject(data.name) || Object.keys(data.name).length === 0) {
    throw new Error('invalid json name');
  }

  if (
    data.assignee !== undefined &&
    data.assignee !== null &&
    !isPlainObject(data.assignee)
  ) {
    throw new Error('invalid json assignee');
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

  if (
    data.assignee !== undefined &&
    data.assignee !== null &&
    !isPlainObject(data.assignee)
  ) {
    throw new Error('invalid json assignee');
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

function buildCreatePayload(data: CreateProjectTaskInput) {
  return {
    ...data,
    plannedStartDate: parseOptionalDate(data.plannedStartDate),
    plannedEndDate: parseOptionalDate(data.plannedEndDate),
    actualStartDate: parseOptionalDate(data.actualStartDate),
    actualEndDate: parseOptionalDate(data.actualEndDate),
    lastApprovedDeadline: parseOptionalDate(data.lastApprovedDeadline),
  };
}

function buildUpdatePayload(
  data: UpdateProjectTaskInput,
): RepositoryUpdateProjectTaskInput {
  return {
    ...(data.name !== undefined && { name: data.name }),
    ...(data.assignee !== undefined && { assignee: data.assignee }),
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
  create: async (data: CreateProjectTaskInput): Promise<ProjectTaskRecord> => {
    assertCreateInput(data);

    try {
      const project = await projectRepository.findById(
        data.projectId,
        data.domainId,
      );

      if (!project) {
        throw new Error('not found');
      }

      const stage = await projectStageRepository.findById(
        data.stageId,
        data.domainId,
      );

      if (!stage || stage.projectId !== data.projectId) {
        throw new Error('not found');
      }

      let code = generateCode('PROJECT_TASK');

      while (
        await projectTaskRepository.findByCode(
          code,
          data.domainId,
          data.projectId,
          data.stageId,
        )
      ) {
        code = generateCode('PROJECT_TASK');
      }

      return await projectTaskRepository.create({
        ...buildCreatePayload(data),
        code,
      });
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  getAll: async (
    domainId: string,
    projectId?: string,
    stageId?: string,
  ): Promise<ProjectTaskRecord[]> => {
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
      return await projectTaskRepository.findMany(domainId, projectId, stageId);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  getById: async (
    id: string,
    domainId: string,
  ): Promise<ProjectTaskRecord | null> => {
    if (!isNonEmptyString(id) || !isNonEmptyString(domainId)) {
      throw new Error('invalid ids');
    }

    try {
      return await projectTaskRepository.findById(id, domainId);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  update: async (
    id: string,
    domainId: string,
    data: UpdateProjectTaskInput,
  ): Promise<ProjectTaskRecord | null> => {
    if (!isNonEmptyString(id) || !isNonEmptyString(domainId)) {
      throw new Error('invalid ids');
    }

    assertUpdateInput(data);

    try {
      const existingTask = await projectTaskRepository.findById(id, domainId);

      if (!existingTask) {
        throw new Error('not found');
      }

      return await projectTaskRepository.update(
        id,
        domainId,
        buildUpdatePayload(data),
      );
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  softDelete: async (
    id: string,
    domainId: string,
  ): Promise<ProjectTaskRecord | null> => {
    if (!isNonEmptyString(id) || !isNonEmptyString(domainId)) {
      throw new Error('invalid ids');
    }

    try {
      const existingTask = await projectTaskRepository.findById(id, domainId);

      if (!existingTask) {
        throw new Error('not found');
      }

      return await projectTaskRepository.softDelete(id, domainId);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },
};
