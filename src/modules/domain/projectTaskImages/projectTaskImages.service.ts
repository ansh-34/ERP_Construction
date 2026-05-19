import {
  projectTaskImageRepository,
  projectTaskRepository,
  type ProjectTaskImageRecord,
} from '@repositories/index';
import { StatusEnum } from '@constants/index';
import { normalizePrismaError } from '@/utils/prismaError';
import { normalizePagination, type PaginationQuery } from '@/utils/pagination';
import { isNonEmptyString, isPlainObject } from '@/utils/validation';

export interface CreateProjectTaskImageInput {
  imageUrl: string;
  imageName?: Record<string, unknown> | null;
  imageType?: string | null;
  description?: Record<string, unknown> | null;
  taskId: string;
  domainId: string;
  adminId: string;
  status: StatusEnum;
}

type PaginatedProjectTaskImages = {
  projectTaskImages: ProjectTaskImageRecord[];
  pagination: {
    totalCount: number;
    offset: number;
    limit: number;
  };
};

function assertStatus(status: StatusEnum | undefined): void {
  if (
    status !== undefined &&
    status !== StatusEnum.ACTIVE &&
    status !== StatusEnum.INACTIVE
  ) {
    throw new Error('invalid status');
  }
}

function assertOptionalJson(
  value: Record<string, unknown> | null | undefined,
  field: string,
): void {
  if (value !== undefined && value !== null && !isPlainObject(value)) {
    throw new Error(`invalid ${field}`);
  }
}

function assertCreateInput(data: CreateProjectTaskImageInput): void {
  if (!isNonEmptyString(data.imageUrl)) {
    throw new Error('invalid imageUrl');
  }

  assertOptionalJson(data.imageName, 'imageName');
  assertOptionalJson(data.description, 'description');

  if (
    data.imageType !== undefined &&
    data.imageType !== null &&
    !isNonEmptyString(data.imageType)
  ) {
    throw new Error('invalid imageType');
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

  assertStatus(data.status);
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

      return await projectTaskImageRepository.create({
        imageUrl: data.imageUrl,
        ...(data.imageName !== undefined && { imageName: data.imageName }),
        ...(data.imageType !== undefined && { imageType: data.imageType }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        taskId: data.taskId,
        stageId: task.stageId,
        projectId: task.projectId,
        domainId: data.domainId,
        adminId: data.adminId,
        status: data.status,
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
