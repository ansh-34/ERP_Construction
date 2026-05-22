import {
  mediaRepository,
  projectTaskImageRepository,
  projectTaskRepository,
  type ProjectTaskImageRecord,
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
}

type PaginatedProjectTaskImages = {
  projectTaskImages: ProjectTaskImageRecord[];
  pagination: {
    totalCount: number;
    offset: number;
    limit: number;
  };
};

function assertCreateInput(data: CreateProjectTaskImageInput): void {
  if (!isNonEmptyString(data.imageId)) {
    throw new Error('invalid imageId');
  }

  if (!isNonEmptyString(data.taskId)) {
    throw new Error('invalid taskId');
  }

  if (!isNonEmptyString(data.domainId)) {
    throw new Error('invalid domainId');
  }

  if (!isNonEmptyString(data.adminId)) {
    throw new Error('invalid adminId');
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

      if (!task) {
        throw new Error('not found');
      }

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
    taskId?: string,
    paginationQuery: PaginationQuery = {},
  ): Promise<PaginatedProjectTaskImages> => {
    if (!isNonEmptyString(domainId) || !isNonEmptyString(adminId)) {
      throw new Error('invalid ids');
    }

    if (taskId !== undefined && !isNonEmptyString(taskId)) {
      throw new Error('invalid taskId');
    }

    try {
      const { offset, limit } = normalizePagination(paginationQuery);
      const projectTaskImages = await projectTaskImageRepository.findMany(
        domainId,
        adminId,
        taskId,
      );

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
  ): Promise<ProjectTaskImageRecord | null> => {
    if (
      !isNonEmptyString(id) ||
      !isNonEmptyString(domainId) ||
      !isNonEmptyString(adminId)
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

      return await projectTaskImageRepository.softDelete(id, domainId, adminId);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },
};
