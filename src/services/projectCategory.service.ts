import {
  projectCategoryRepository,
  type ProjectCategoryRecord,
} from '@repositories/index';
import { StatusEnum } from '@constants/index';
import { normalizePrismaError } from '@/utils/prismaError';
import { generateCode } from '@/utils/code';
import { isNonEmptyString, isPlainObject } from '@/utils/validation';

export interface CreateProjectCategoryInput {
  name: Record<string, unknown>;
  description?: Record<string, unknown> | null;
  parentCategoryId?: string | null;
  domainId: string;
  status: StatusEnum;
}

export interface UpdateProjectCategoryInput {
  name?: Record<string, unknown>;
  description?: Record<string, unknown> | null;
  parentCategoryId?: string | null;
  status?: StatusEnum;
}

function assertCreateInput(data: CreateProjectCategoryInput): void {
  if (!isPlainObject(data.name)) {
    throw new Error('invalid json name');
  }

  if (
    data.description !== undefined &&
    data.description !== null &&
    !isPlainObject(data.description)
  ) {
    throw new Error('invalid json description');
  }

  if (!isNonEmptyString(data.domainId)) {
    throw new Error('invalid domainId');
  }

  if (
    data.parentCategoryId !== undefined &&
    data.parentCategoryId !== null &&
    !isNonEmptyString(data.parentCategoryId)
  ) {
    throw new Error('invalid parentCategoryId');
  }

  if (
    data.status !== StatusEnum.ACTIVE &&
    data.status !== StatusEnum.INACTIVE
  ) {
    throw new Error('invalid status');
  }
}

function assertUpdateInput(data: UpdateProjectCategoryInput): void {
  const hasName = data.name !== undefined;
  const hasDescription = data.description !== undefined;
  const hasParentCategoryId = data.parentCategoryId !== undefined;
  const hasStatus = data.status !== undefined;

  if (!hasName && !hasDescription && !hasParentCategoryId && !hasStatus) {
    throw new Error('empty update payload');
  }

  if (hasName && !isPlainObject(data.name)) {
    throw new Error('invalid json name');
  }

  if (
    hasDescription &&
    data.description !== null &&
    !isPlainObject(data.description)
  ) {
    throw new Error('invalid json description');
  }

  if (
    hasParentCategoryId &&
    data.parentCategoryId !== null &&
    !isNonEmptyString(data.parentCategoryId)
  ) {
    throw new Error('invalid parentCategoryId');
  }

  if (
    hasStatus &&
    data.status !== StatusEnum.ACTIVE &&
    data.status !== StatusEnum.INACTIVE
  ) {
    throw new Error('invalid status');
  }
}

export const projectCategoryService = {
  create: async (
    data: CreateProjectCategoryInput,
  ): Promise<ProjectCategoryRecord> => {
    assertCreateInput(data);

    try {
      let code = generateCode('PROJECT_CATEGORY');

      while (await projectCategoryRepository.findByCode(code, data.domainId)) {
        code = generateCode('PROJECT_CATEGORY');
      }

      if (data.parentCategoryId) {
        const parentCategory = await projectCategoryRepository.findById(
          data.parentCategoryId,
          data.domainId,
        );

        if (!parentCategory) {
          throw new Error('not found');
        }
      }

      return await projectCategoryRepository.create({
        ...data,
        code,
      });
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  getAll: async (domainId: string): Promise<ProjectCategoryRecord[]> => {
    if (!isNonEmptyString(domainId)) {
      throw new Error('invalid domainId');
    }

    try {
      return await projectCategoryRepository.findMany(domainId);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  getById: async (
    id: string,
    domainId: string,
  ): Promise<ProjectCategoryRecord | null> => {
    if (!isNonEmptyString(id) || !isNonEmptyString(domainId)) {
      throw new Error('invalid ids');
    }

    try {
      return await projectCategoryRepository.findById(id, domainId);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  update: async (
    id: string,
    domainId: string,
    data: UpdateProjectCategoryInput,
  ): Promise<ProjectCategoryRecord | null> => {
    if (!isNonEmptyString(id) || !isNonEmptyString(domainId)) {
      throw new Error('invalid ids');
    }

    assertUpdateInput(data);

    try {
      const existingCategory = await projectCategoryRepository.findById(
        id,
        domainId,
      );

      if (!existingCategory) {
        throw new Error('not found');
      }

      if (data.parentCategoryId) {
        const parentCategory = await projectCategoryRepository.findById(
          data.parentCategoryId,
          domainId,
        );

        if (!parentCategory) {
          throw new Error('not found');
        }
      }

      return await projectCategoryRepository.update(id, domainId, data);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  softDelete: async (
    id: string,
    domainId: string,
  ): Promise<ProjectCategoryRecord | null> => {
    if (!isNonEmptyString(id) || !isNonEmptyString(domainId)) {
      throw new Error('invalid ids');
    }

    try {
      const existingCategory = await projectCategoryRepository.findById(
        id,
        domainId,
      );

      if (!existingCategory) {
        throw new Error('not found');
      }

      return await projectCategoryRepository.softDelete(id, domainId);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },
};
