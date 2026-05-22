import {
  mediaRepository,
  projectTaskImageRepository,
  projectTaskRepository,
  type ProjectTaskImageRecord,
  type ProjectTaskRecord,
} from '@repositories/index';
import { normalizePrismaError } from '@/utils/prismaError';
import { normalizePagination, type PaginationQuery } from '@/utils/pagination';
import { isNonEmptyString } from '@/utils/validation';

export interface CreateProjectTaskImageInput {
  imageId: string;
  description?: string | null;
  taskId: string;
  domainId: string;
  adminId: string;
  userId: string;
}

type PaginatedProjectTaskImages = {
  projectTaskImages: ProjectTaskImageRecord[];
  pagination: {
    totalCount: number;
    offset: number;
    limit: number;
  };
};

function getAssigneeUserId(value: unknown): string | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  const assignee = value as Record<string, unknown>;
  return typeof assignee.userId === 'string' ? assignee.userId : null;
}

function assertUserCanAccessTask(
  task: ProjectTaskRecord | null,
  userId: string,
): asserts task is ProjectTaskRecord {
  if (!task) {
    throw new Error('not found');
  }

  if (getAssigneeUserId(task.assignee) !== userId) {
    throw new Error('unauthorized');
  }
}

function assertCreateInput(data: CreateProjectTaskImageInput): void {
  if (!isNonEmptyString(data.imageId)) {
    throw new Error('invalid imageId');
  }

  if (
    !isNonEmptyString(data.taskId) ||
    !isNonEmptyString(data.domainId) ||
    !isNonEmptyString(data.adminId) ||
    !isNonEmptyString(data.userId)
  ) {
    throw new Error('invalid ids');
  }

  if (
    data.description !== undefined &&
    data.description !== null &&
    !isNonEmptyString(data.description)
  ) {
    throw new Error('description is required');
  }

  if (data.description && /[\r\n]/.test(data.description)) {
    throw new Error('description must be single-line');
  }
}

export const projectTaskImagesService = {
  create: async (
    data: CreateProjectTaskImageInput,
  ): Promise<ProjectTaskImageRecord> => {
    assertCreateInput(data);

    try {
      const task = await projectTaskRepository.findById(
        data.taskId,
        data.domainId,
        data.adminId,
      );
      assertUserCanAccessTask(task, data.userId);

      const media = await mediaRepository.findById(
        data.imageId,
        data.domainId,
        data.adminId,
      );

      if (!media) {
        throw new Error('not found');
      }

      return await projectTaskImageRepository.create({
        imageId: media.id,
        imageUrl: media.url,
        ...(data.description !== undefined && {
          description: data.description,
        }),
        taskId: data.taskId,
        stageId: task.stageId,
        projectId: task.projectId,
        domainId: data.domainId,
        adminId: data.adminId,
      });
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  getAll: async (
    domainId: string,
    adminId: string,
    userId: string,
    taskId?: string,
    paginationQuery: PaginationQuery = {},
  ): Promise<PaginatedProjectTaskImages> => {
    if (
      !isNonEmptyString(domainId) ||
      !isNonEmptyString(adminId) ||
      !isNonEmptyString(userId)
    ) {
      throw new Error('invalid ids');
    }

    if (taskId !== undefined && !isNonEmptyString(taskId)) {
      throw new Error('invalid taskId');
    }

    try {
      if (taskId) {
        const task = await projectTaskRepository.findById(
          taskId,
          domainId,
          adminId,
        );
        assertUserCanAccessTask(task, userId);
      }

      const { offset, limit } = normalizePagination(paginationQuery);
      const allImages = await projectTaskImageRepository.findMany(
        domainId,
        adminId,
        taskId,
      );

      const projectTaskImages = taskId
        ? allImages
        : (
            await Promise.all(
              allImages.map(async (image) => {
                const task = await projectTaskRepository.findById(
                  image.taskId,
                  domainId,
                  adminId,
                );

                return task && getAssigneeUserId(task.assignee) === userId
                  ? image
                  : null;
              }),
            )
          ).filter((image): image is ProjectTaskImageRecord => Boolean(image));

      return {
        projectTaskImages: projectTaskImages.slice(offset, offset + limit),
        pagination: {
          totalCount: projectTaskImages.length,
          offset,
          limit,
        },
      };
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  softDelete: async (
    id: string,
    domainId: string,
    adminId: string,
    userId: string,
  ): Promise<ProjectTaskImageRecord | null> => {
    if (
      !isNonEmptyString(id) ||
      !isNonEmptyString(domainId) ||
      !isNonEmptyString(adminId) ||
      !isNonEmptyString(userId)
    ) {
      throw new Error('invalid ids');
    }

    try {
      const existingImage = await projectTaskImageRepository.findById(
        id,
        domainId,
        adminId,
      );

      if (!existingImage) {
        throw new Error('not found');
      }

      const task = await projectTaskRepository.findById(
        existingImage.taskId,
        domainId,
        adminId,
      );
      assertUserCanAccessTask(task, userId);

      return await projectTaskImageRepository.softDelete(id, domainId, adminId);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },
};
