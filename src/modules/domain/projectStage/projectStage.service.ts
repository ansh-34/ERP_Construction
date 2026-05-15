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
  adminId: string;
  status: StatusEnum;
}

export interface UpdateProjectStageInput {
  name?: Record<string, unknown>;
  description?: Record<string, unknown> | null;
  progress?: number | null;
  status?: StatusEnum;
}

type LocalizedProjectStageRecord = Omit<
  ProjectStageRecord,
  'name' | 'description'
> & {
  name: string;
  description: string | null;
};

function buildProjectStageCode(name: Record<string, unknown>): string {
  return name.en?.toString().toUpperCase().replace(/\s+/g, '_') || '';
}

function buildProjectStageSearchText(name: Record<string, unknown>): string {
  return Object.values(name).join(' ').toLowerCase();
}

function getLocalizedText(
  value: Record<string, unknown> | null,
  language: string | null,
): string | null {
  if (!value) {
    return null;
  }

  const langCode = language || 'en';
  const localizedValue = value[langCode] ?? value.en ?? '';

  return typeof localizedValue === 'string'
    ? localizedValue
    : String(localizedValue);
}

function normalizeProjectStage(
  stage: ProjectStageRecord,
  language: string | null,
): LocalizedProjectStageRecord {
  return {
    ...stage,
    name: getLocalizedText(stage.name, language) || '',
    description: getLocalizedText(stage.description, language),
  };
}

function assertCreateInput(data: CreateProjectStageInput): void {
  if (!isPlainObject(data.name) || Object.keys(data.name).length === 0) {
    throw new Error('invalid json name');
  }

  if (!isNonEmptyString(data.name.en)) {
    throw new Error('name.en is required');
  }

  if (
    data.description !== undefined &&
    data.description !== null &&
    !isPlainObject(data.description)
  ) {
    throw new Error('invalid json description');
  }

  if (
    data.description !== undefined &&
    data.description !== null &&
    !isNonEmptyString(data.description.en)
  ) {
    throw new Error('description.en is required');
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

  if (hasName && !isNonEmptyString(data.name?.en)) {
    throw new Error('name.en is required');
  }

  if (
    hasDescription &&
    data.description !== null &&
    !isPlainObject(data.description)
  ) {
    throw new Error('invalid json description');
  }

  if (
    hasDescription &&
    data.description !== null &&
    !isNonEmptyString(data.description?.en)
  ) {
    throw new Error('description.en is required');
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
    language: string | null = null,
  ): Promise<LocalizedProjectStageRecord> => {
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

      const code = buildProjectStageCode(data.name);

      if (
        await projectStageRepository.findByCode(
          code,
          data.domainId,
          data.projectId,
          data.adminId,
        )
      ) {
        throw new Error('duplicate code');
      }

      const stage = await projectStageRepository.create({
        ...data,
        code,
        searchText: buildProjectStageSearchText(data.name),
      });

      return normalizeProjectStage(stage, language);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  getAll: async (
    domainId: string,
    adminId: string,
    projectId: string,
    searchKey?: string,
    language: string | null = null,
  ): Promise<LocalizedProjectStageRecord[]> => {
    if (!isNonEmptyString(domainId) || !isNonEmptyString(projectId)) {
      throw new Error('invalid ids');
    }

    try {
      const stages = await projectStageRepository.findMany(
        domainId,
        projectId,
        adminId,
        searchKey,
      );
      return stages.map((stage) => normalizeProjectStage(stage, language));
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  getById: async (
    id: string,
    domainId: string,
    adminId: string,
    language: string | null = null,
  ): Promise<LocalizedProjectStageRecord | null> => {
    if (!isNonEmptyString(id) || !isNonEmptyString(domainId)) {
      throw new Error('invalid ids');
    }

    try {
      const stage = await projectStageRepository.findById(
        id,
        domainId,
        adminId,
      );
      return stage ? normalizeProjectStage(stage, language) : null;
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  update: async (
    id: string,
    domainId: string,
    adminId: string,
    data: UpdateProjectStageInput,
    language: string | null = null,
  ): Promise<LocalizedProjectStageRecord | null> => {
    if (!isNonEmptyString(id) || !isNonEmptyString(domainId)) {
      throw new Error('invalid ids');
    }

    assertUpdateInput(data);

    try {
      const existingStage = await projectStageRepository.findById(
        id,
        domainId,
        adminId,
      );

      if (!existingStage) {
        throw new Error('not found');
      }

      const updateData = {
        ...data,
        ...(data.name !== undefined
          ? {
              ...(data.name !== undefined && {
                code: buildProjectStageCode(data.name),
              }),
              searchText: buildProjectStageSearchText(data.name),
            }
          : {}),
      };

      if (updateData.code && updateData.code !== existingStage.code) {
        const duplicateStage = await projectStageRepository.findByCode(
          updateData.code,
          domainId,
          existingStage.projectId,
          adminId,
        );

        if (duplicateStage && duplicateStage.id !== id) {
          throw new Error('duplicate code');
        }
      }

      const stage = await projectStageRepository.update(
        id,
        domainId,
        updateData,
        adminId,
      );
      return stage ? normalizeProjectStage(stage, language) : null;
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  softDelete: async (
    id: string,
    domainId: string,
    adminId: string,
  ): Promise<ProjectStageRecord | null> => {
    if (!isNonEmptyString(id) || !isNonEmptyString(domainId)) {
      throw new Error('invalid ids');
    }

    try {
      const existingStage = await projectStageRepository.findById(
        id,
        domainId,
        adminId,
      );

      if (!existingStage) {
        throw new Error('not found');
      }

      return await projectStageRepository.softDelete(id, domainId, adminId);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },
};
