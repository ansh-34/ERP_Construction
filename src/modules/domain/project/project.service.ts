import {
  projectRepository,
  projectCategoryRepository,
  type ProjectRecord,
  type UpdateProjectInput,
} from '@repositories/index';
import { StatusEnum } from '@constants/index';
import { normalizePrismaError } from '@/utils/prismaError';
import { generateCode } from '@/utils/code';
import {
  isNonEmptyString,
  isPlainObject,
  isNonNegativeFiniteNumber,
} from '@/utils/validation';

export interface CreateProjectInput {
  name: Record<string, unknown>;
  projectCategoryId: string;
  description?: Record<string, unknown> | null;
  budget: number;
  spent?: number;
  locationId: string;
  domainId: string;
  status: StatusEnum;
}

function assertCreateInput(data: CreateProjectInput): void {
  if (!isPlainObject(data.name)) {
    throw new Error('invalid json name');
  }

  if (!isNonEmptyString(data.projectCategoryId)) {
    throw new Error('invalid projectCategoryId');
  }

  if (
    data.description !== undefined &&
    data.description !== null &&
    !isPlainObject(data.description)
  ) {
    throw new Error('invalid json description');
  }

  if (!isNonNegativeFiniteNumber(data.budget)) {
    throw new Error('invalid budget');
  }

  if (!isNonEmptyString(data.locationId)) {
    throw new Error('invalid locationId');
  }

  if (!isNonEmptyString(data.domainId)) {
    throw new Error('invalid domainId');
  }
}

function assertUpdateInput(data: UpdateProjectInput): void {
  const hasName = data.name !== undefined;
  const hasDescription = data.description !== undefined;
  const hasBudget = data.budget !== undefined;
  const hasSpent = data.spent !== undefined;
  const hasStatus = data.status !== undefined;

  if (!hasName && !hasDescription && !hasBudget && !hasSpent && !hasStatus) {
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

  if (hasBudget && !isNonNegativeFiniteNumber(data.budget as number)) {
    throw new Error('invalid budget');
  }

  if (hasSpent && !isNonNegativeFiniteNumber(data.spent as number)) {
    throw new Error('invalid spent');
  }
}

export const projectService = {
  create: async (data: CreateProjectInput): Promise<ProjectRecord> => {
    assertCreateInput(data);

    try {
      let code = generateCode('PROJECT');

      while (await projectRepository.findByCode(code, data.domainId)) {
        code = generateCode('PROJECT');
      }

      const existingCategory = await projectCategoryRepository.findById(
        data.projectCategoryId,
        data.domainId,
      );

      if (!existingCategory) {
        throw new Error('not found');
      }

      return await projectRepository.create({
        ...data,
        code,
      });
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  getAll: async (domainId: string): Promise<ProjectRecord[]> => {
    if (!isNonEmptyString(domainId)) {
      throw new Error('invalid domainId');
    }

    try {
      return await projectRepository.findMany(domainId);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  getById: async (
    id: string,
    domainId: string,
  ): Promise<ProjectRecord | null> => {
    if (!isNonEmptyString(id) || !isNonEmptyString(domainId)) {
      throw new Error('invalid ids');
    }

    try {
      return await projectRepository.findById(id, domainId);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  update: async (
    id: string,
    domainId: string,
    data: UpdateProjectInput,
  ): Promise<ProjectRecord | null> => {
    if (!isNonEmptyString(id) || !isNonEmptyString(domainId)) {
      throw new Error('invalid ids');
    }

    assertUpdateInput(data);

    try {
      const existingProject = await projectRepository.findById(id, domainId);

      if (!existingProject) {
        throw new Error('not found');
      }

      return await projectRepository.update(id, domainId, data);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  softDelete: async (
    id: string,
    domainId: string,
  ): Promise<ProjectRecord | null> => {
    if (!isNonEmptyString(id) || !isNonEmptyString(domainId)) {
      throw new Error('invalid ids');
    }

    try {
      const existingProject = await projectRepository.findById(id, domainId);

      if (!existingProject) {
        throw new Error('not found');
      }

      return await projectRepository.softDelete(id, domainId);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },
};
