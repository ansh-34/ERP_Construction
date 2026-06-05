import {
  mediaRepository,
  projectRepository,
  projectTaskImageRepository,
  projectStageRepository,
  projectTaskRepository,
  UserRepository,
  type ProjectTaskImageRecord,
  type ProjectTaskRecord,
  type UpdateProjectTaskInput as RepositoryUpdateProjectTaskInput,
} from '@repositories/index';
import { StatusEnum } from '@constants/index';
import {
  transaction,
  type TransactionClient,
} from '@/infra/database/prisma/transaction.js';
import { normalizePrismaError } from '@/utils/prismaError';
import { normalizePagination, type PaginationQuery } from '@/utils/pagination';
import {
  isNonEmptyString,
  isNonNegativeFiniteNumber,
  isPlainObject,
} from '@/utils/validation';

interface ProjectTaskImageInput {
  imageId: string;
  description?: string | null;
}

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
  requiredApproval?: boolean | null;
  lastApprovedDeadline?: string | null;
  projectBatchCode?: string | null;
  stageId: string;
  projectId: string;
  domainId: string;
  adminId: string;
  images?: ProjectTaskImageInput[];
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
  requiredApproval?: boolean | null;
  lastApprovedDeadline?: string | null;
  projectBatchCode?: string | null;
  images?: ProjectTaskImageInput[];
  status?: StatusEnum;
}

type LocalizedText = string | Record<string, unknown>;

type LocalizedProjectTaskRecord = Omit<
  ProjectTaskRecord,
  'name' | 'assignee'
> & {
  name: LocalizedText;
  assignee: string | null;
  images?: ProjectTaskImageRecord[];
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
): LocalizedText {
  if (!language) {
    return value;
  }

  const localizedValue = value[language] ?? value.en ?? '';

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
  images?: any,
): LocalizedProjectTaskRecord {
  return {
    ...task,
    name: getLocalizedText(task.name, language),
    assignee: getAssigneeUserId(task.assignee),
    stage: normalizeRelationDetails(task.stage, language),
    project: normalizeRelationDetails(task.project, language),
    domain: normalizeRelationDetails(task.domain, language),
    admin: normalizeRelationDetails(task.admin, language),
    assigneeDetails: normalizeRelationDetails(task.assigneeDetails, language),
    ...(images !== undefined && {
      images: images.map((img: any) => ({
        id: img.id,
        imageId: img.imageId,
        imageUrl: img.imageUrl,
        description: getLocalizedText(img.description, language),
      })),
    }),
  };
}

function normalizeRelationDetails(
  relation: ProjectTaskRecord['project'],
  language: string | null,
): Record<string, unknown> | null | undefined {
  if (!relation) {
    return relation;
  }

  const name = relation.name;
  const location = relation.location;

  return {
    ...relation,
    name: isPlainObject(name) ? getLocalizedText(name, language) : name,
    ...(isPlainObject(location)
      ? { location: normalizeRelationDetails(location, language) }
      : {}),
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
    (!isNonNegativeFiniteNumber(data.taskProgress) || data.taskProgress > 100)
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
  assertProjectTaskImages(data.images);
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
    (!isNonNegativeFiniteNumber(data.taskProgress) || data.taskProgress > 100)
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
  assertProjectTaskImages(data.images);
}

function assertProjectTaskImages(
  images: ProjectTaskImageInput[] | undefined,
): void {
  if (images === undefined) {
    return;
  }

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

async function createProjectTaskImages(
  task: ProjectTaskRecord,
  images: ProjectTaskImageInput[] = [],
  tx?: TransactionClient,
): Promise<ProjectTaskImageRecord[]> {
  return Promise.all(
    images.map(async (image) => {
      const media = await mediaRepository.findById(
        image.imageId,
        task.domainId,
        task.adminId,
      );

      if (!media) {
        throw new Error('not found');
      }

      return projectTaskImageRepository.create(
        {
          imageId: media.id,
          imageUrl: media.url,
          ...(image.description !== undefined && {
            description: image.description,
          }),
          taskId: task.id,
          stageId: task.stageId,
          projectId: task.projectId,
          domainId: task.domainId,
          adminId: task.adminId,
        },
        { transaction: tx },
      );
    }),
  );
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

      const { task, images } = await transaction(async (tx) => {
        const task = await projectTaskRepository.create(createPayload, {
          transaction: tx,
        });
        const images = await createProjectTaskImages(task, data.images, tx);
        await projectStageRepository.recalculateProgress(
          task.stageId,
          data.domainId,
          data.adminId,
          { transaction: tx },
        );
        return { task, images };
      });

      return normalizeProjectTask(task, language, images);
    } catch (error: unknown) {
      console.error('[ProjectTaskService.create]', error);
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
      const task: any = await projectTaskRepository.findById(
        id,
        domainId,
        adminId,
      );
      return task ? normalizeProjectTask(task, language, task?.images) : null;
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

      const result = await transaction(async (tx) => {
        const task = await projectTaskRepository.update(
          id,
          domainId,
          updatePayload,
          adminId,
          { transaction: tx },
        );

        if (!task) return null;

        const images = await createProjectTaskImages(task, data.images, tx);
        await projectStageRepository.recalculateProgress(
          task.stageId,
          domainId,
          adminId,
          { transaction: tx },
        );
        return { task, images };
      });

      return result
        ? normalizeProjectTask(result.task, language, result.images)
        : null;
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
      const existingTasks: ProjectTaskRecord[] = [];

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

      const updatedTasks = await transaction(async (tx) => {
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
            { transaction: tx },
          );

          if (updatedTask) {
            await projectStageRepository.recalculateProgress(
              updatedTask.stageId,
              domainId,
              adminId,
              { transaction: tx },
            );
            updatedTasks.push(normalizeProjectTask(updatedTask, language));
          }
        }

        return updatedTasks;
      });

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

      const deletedTask = await transaction(async (tx) => {
        const deletedTask = await projectTaskRepository.softDelete(
          id,
          domainId,
          adminId,
          { transaction: tx },
        );

        if (deletedTask) {
          await projectStageRepository.recalculateProgress(
            deletedTask.stageId,
            domainId,
            adminId,
            { transaction: tx },
          );
        }

        return deletedTask;
      });

      return deletedTask;
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },
};
