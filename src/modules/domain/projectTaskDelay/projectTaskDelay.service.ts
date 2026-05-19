import {
  projectTaskDelayRepository,
  projectTaskRepository,
  type ProjectTaskDelayRecord,
  type UpdateProjectTaskDelayInput as RepositoryUpdateProjectTaskDelayInput,
} from '@repositories/index';
import { StatusEnum } from '@constants/index';
import { normalizePrismaError } from '@/utils/prismaError';
import { normalizePagination, type PaginationQuery } from '@/utils/pagination';
import {
  isNonEmptyString,
  isNonNegativeFiniteNumber,
} from '@/utils/validation';

export interface CreateProjectTaskDelayInput {
  taskId: string;
  requestedDelayInDays: number;
  delayReason: string;
  requestApproved?: boolean;
  requestApprovalTime?: string | null;
  stageId: string;
  projectId: string;
  domainId: string;
  adminId: string;
  status: StatusEnum;
}

export interface UpdateProjectTaskDelayInput {
  requestedDelayInDays?: number;
  delayReason?: string;
  requestApproved?: boolean;
  requestApprovalTime?: string | null;
  status?: StatusEnum;
}

type ApprovalState = 'PENDING' | 'APPROVED' | 'REJECTED';

type LocalizedProjectTaskDelayRecord = Omit<
  ProjectTaskDelayRecord,
  'delayReason'
> & {
  delayReason: string;
  approvalState: ApprovalState;
};

type PaginatedProjectTaskDelays = {
  projectTaskDelays: LocalizedProjectTaskDelayRecord[];
  pagination: {
    totalCount: number;
    offset: number;
    limit: number;
  };
};

function buildProjectTaskDelaySearchText(delayReason: string): string {
  return delayReason.toLowerCase();
}

function normalizeStoredDelayReason(value: Record<string, unknown>): string {
  const reason = value.reason ?? value.en ?? '';
  return typeof reason === 'string' ? reason : String(reason);
}

function normalizeProjectTaskDelay(
  delay: ProjectTaskDelayRecord,
  language: string | null,
): LocalizedProjectTaskDelayRecord {
  const approvalState: ApprovalState = delay.requestApproved
    ? 'APPROVED'
    : delay.requestApprovalTime
      ? 'REJECTED'
      : 'PENDING';

  return {
    ...delay,
    delayReason: normalizeStoredDelayReason(delay.delayReason),
    approvalState,
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

function assertCreateInput(data: CreateProjectTaskDelayInput): void {
  if (!isNonEmptyString(data.taskId)) {
    throw new Error('invalid taskId');
  }

  if (!isNonNegativeFiniteNumber(data.requestedDelayInDays)) {
    throw new Error('invalid requestedDelayInDays');
  }

  if (!isNonEmptyString(data.delayReason)) {
    throw new Error('invalid delayReason');
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

function assertUpdateInput(data: UpdateProjectTaskDelayInput): void {
  const hasAnyField = Object.values(data).some((value) => value !== undefined);

  if (!hasAnyField) {
    throw new Error('empty update payload');
  }

  if (
    data.requestedDelayInDays !== undefined &&
    !isNonNegativeFiniteNumber(data.requestedDelayInDays)
  ) {
    throw new Error('invalid requestedDelayInDays');
  }

  if (data.delayReason !== undefined && !isNonEmptyString(data.delayReason)) {
    throw new Error('invalid delayReason');
  }

  assertStatus(data.status);
}

function buildCreatePayload(data: CreateProjectTaskDelayInput) {
  return {
    ...data,
    delayReason: { reason: data.delayReason },
    searchText: buildProjectTaskDelaySearchText(data.delayReason),
    requestApprovalTime: parseOptionalDate(data.requestApprovalTime),
  };
}

function buildUpdatePayload(
  data: UpdateProjectTaskDelayInput,
): RepositoryUpdateProjectTaskDelayInput {
  return {
    ...(data.delayReason !== undefined && {
      searchText: buildProjectTaskDelaySearchText(data.delayReason),
    }),
    ...(data.requestedDelayInDays !== undefined && {
      requestedDelayInDays: data.requestedDelayInDays,
    }),
    ...(data.delayReason !== undefined && {
      delayReason: { reason: data.delayReason },
    }),
    ...(data.requestApproved !== undefined && {
      requestApproved: data.requestApproved,
    }),
    ...(data.requestApprovalTime !== undefined && {
      requestApprovalTime: parseOptionalDate(data.requestApprovalTime),
    }),
    ...(data.status !== undefined && { status: data.status }),
  };
}

export const projectTaskDelayService = {
  create: async (
    data: CreateProjectTaskDelayInput,
    language: string | null = null,
  ): Promise<LocalizedProjectTaskDelayRecord> => {
    assertCreateInput(data);

    try {
      const task = await projectTaskRepository.findById(
        data.taskId,
        data.domainId,
        data.adminId,
      );

      if (
        !task ||
        task.projectId !== data.projectId ||
        task.stageId !== data.stageId
      ) {
        throw new Error('not found');
      }

      const delay = await projectTaskDelayRepository.create(
        buildCreatePayload(data),
      );

      return normalizeProjectTaskDelay(delay, language);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  getAll: async (
    domainId: string,
    adminId: string,
    projectId?: string,
    stageId?: string,
    taskId?: string,
    searchKey?: string,
    paginationQuery: PaginationQuery = {},
    language: string | null = null,
  ): Promise<PaginatedProjectTaskDelays> => {
    if (!isNonEmptyString(domainId)) {
      throw new Error('invalid domainId');
    }

    if (projectId !== undefined && !isNonEmptyString(projectId)) {
      throw new Error('invalid projectId');
    }

    if (stageId !== undefined && !isNonEmptyString(stageId)) {
      throw new Error('invalid stageId');
    }

    if (taskId !== undefined && !isNonEmptyString(taskId)) {
      throw new Error('invalid taskId');
    }

    try {
      const { offset, limit } = normalizePagination(paginationQuery);
      const delays = await projectTaskDelayRepository.findMany(
        domainId,
        adminId,
        projectId,
        stageId,
        taskId,
        searchKey,
      );
      const paginatedDelays = delays.slice(offset, offset + limit);

      return {
        projectTaskDelays: paginatedDelays.map((delay) =>
          normalizeProjectTaskDelay(delay, language),
        ),
        pagination: {
          totalCount: delays.length,
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
  ): Promise<LocalizedProjectTaskDelayRecord | null> => {
    if (!isNonEmptyString(id) || !isNonEmptyString(domainId)) {
      throw new Error('invalid ids');
    }

    try {
      const delay = await projectTaskDelayRepository.findById(
        id,
        domainId,
        adminId,
      );
      return delay ? normalizeProjectTaskDelay(delay, language) : null;
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  update: async (
    id: string,
    domainId: string,
    adminId: string,
    data: UpdateProjectTaskDelayInput,
    language: string | null = null,
  ): Promise<LocalizedProjectTaskDelayRecord | null> => {
    if (!isNonEmptyString(id) || !isNonEmptyString(domainId)) {
      throw new Error('invalid ids');
    }

    assertUpdateInput(data);

    try {
      const existingDelay = await projectTaskDelayRepository.findById(
        id,
        domainId,
        adminId,
      );

      if (!existingDelay) {
        throw new Error('not found');
      }

      const delay = await projectTaskDelayRepository.update(
        id,
        domainId,
        buildUpdatePayload(data),
        adminId,
      );

      return delay ? normalizeProjectTaskDelay(delay, language) : null;
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  softDelete: async (
    id: string,
    domainId: string,
    adminId: string,
  ): Promise<ProjectTaskDelayRecord | null> => {
    if (!isNonEmptyString(id) || !isNonEmptyString(domainId)) {
      throw new Error('invalid ids');
    }

    try {
      const existingDelay = await projectTaskDelayRepository.findById(
        id,
        domainId,
        adminId,
      );

      if (!existingDelay) {
        throw new Error('not found');
      }

      return await projectTaskDelayRepository.softDelete(id, domainId, adminId);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },
};
