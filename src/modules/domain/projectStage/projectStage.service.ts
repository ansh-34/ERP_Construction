import {
  projectRepository,
  projectStageRepository,
  type ProjectStageRecord,
} from '@repositories/index';
import { StatusEnum } from '@constants/index';
import { normalizePrismaError } from '@/utils/prismaError';
import {
  isNonEmptyString,
  isNonNegativeFiniteNumber,
  isPlainObject,
} from '@/utils/validation';

export interface CreateProjectStageInput {
  name: Record<string, unknown>;
  description?: Record<string, unknown> | null;
  progress?: number | null;
  projectId: string;
  domainId: string;
  status: StatusEnum;
}

export interface UpdateProjectStageInput {
  name?: Record<string, unknown>;
  description?: Record<string, unknown> | null;
  progress?: number | null;
  status?: StatusEnum;
}

function generateStageCode(projectId: string): string {
  return `STG-${projectId.slice(0, 4)}-${Date.now()}`;
}

function assertCreateInput(data: CreateProjectStageInput): void {
  if (!isPlainObject(data.name) || Object.keys(data.name).length === 0) {
    throw new Error('invalid json name');
  }

  if (
    data.description !== undefined &&
    data.description !== null &&
    !isPlainObject(data.description)
  ) {
    throw new Error('invalid json description');
  }

  if (
    data.progress !== undefined &&
    data.progress !== null &&
    !isNonNegativeFiniteNumber(data.progress)
  ) {
    throw new Error('invalid progress');
  }

  if (!isNonEmptyString(data.projectId)) {
    throw new Error('invalid projectId');
  }

  if (!isNonEmptyString(data.domainId)) {
    throw new Error('invalid domainId');
  }

  if (
    data.status !== StatusEnum.ACTIVE &&
    data.status !== StatusEnum.INACTIVE
  ) {
    throw new Error('invalid status');
  }
}

function assertUpdateInput(data: UpdateProjectStageInput): void {
  const hasName = data.name !== undefined;
  const hasDescription = data.description !== undefined;
  const hasProgress = data.progress !== undefined;
  const hasStatus = data.status !== undefined;

  if (!hasName && !hasDescription && !hasProgress && !hasStatus) {
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
    hasProgress &&
    data.progress !== null &&
    !isNonNegativeFiniteNumber(data.progress)
  ) {
    throw new Error('invalid progress');
  }

  if (
    hasStatus &&
    data.status !== StatusEnum.ACTIVE &&
    data.status !== StatusEnum.INACTIVE
  ) {
    throw new Error('invalid status');
  }
}

export const projectStageService = {
  create: async (
    data: CreateProjectStageInput,
  ): Promise<ProjectStageRecord> => {
    assertCreateInput(data);

    try {
      const project = await projectRepository.findById(
        data.projectId,
        data.domainId,
      );

      if (!project) {
        throw new Error('not found');
      }

      let code = generateStageCode(data.projectId);

      while (
        await projectStageRepository.findByCode(
          code,
          data.domainId,
          data.projectId,
        )
      ) {
        code = generateStageCode(data.projectId);
      }

      return await projectStageRepository.create({
        ...data,
        code,
      });
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  getAll: async (
    domainId: string,
    projectId: string,
  ): Promise<ProjectStageRecord[]> => {
    if (!isNonEmptyString(domainId) || !isNonEmptyString(projectId)) {
      throw new Error('invalid ids');
    }

    try {
      return await projectStageRepository.findMany(domainId, projectId);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  getById: async (
    id: string,
    domainId: string,
  ): Promise<ProjectStageRecord | null> => {
    if (!isNonEmptyString(id) || !isNonEmptyString(domainId)) {
      throw new Error('invalid ids');
    }

    try {
      return await projectStageRepository.findById(id, domainId);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  update: async (
    id: string,
    domainId: string,
    data: UpdateProjectStageInput,
  ): Promise<ProjectStageRecord | null> => {
    if (!isNonEmptyString(id) || !isNonEmptyString(domainId)) {
      throw new Error('invalid ids');
    }

    assertUpdateInput(data);

    try {
      const existingStage = await projectStageRepository.findById(id, domainId);

      if (!existingStage) {
        throw new Error('not found');
      }

      return await projectStageRepository.update(id, domainId, data);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  softDelete: async (
    id: string,
    domainId: string,
  ): Promise<ProjectStageRecord | null> => {
    if (!isNonEmptyString(id) || !isNonEmptyString(domainId)) {
      throw new Error('invalid ids');
    }

    try {
      const existingStage = await projectStageRepository.findById(id, domainId);

      if (!existingStage) {
        throw new Error('not found');
      }

      return await projectStageRepository.softDelete(id, domainId);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },
};
