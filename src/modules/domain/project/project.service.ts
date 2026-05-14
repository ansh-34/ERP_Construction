import {
  projectRepository,
  projectCategoryRepository,
  type ProjectRecord,
  type UpdateProjectInput,
} from '@repositories/index';
import { StatusEnum } from '@constants/index';
import { normalizePrismaError } from '@/utils/prismaError';
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

type LocalizedProjectRecord = Omit<ProjectRecord, 'name' | 'description'> & {
  name: string;
  description: string | null;
};

function buildProjectCode(name: Record<string, unknown>): string {
  return name.en?.toString().toUpperCase().replace(/\s+/g, '_') || '';
}

function buildProjectSearchText(name: Record<string, unknown>): string {
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

function normalizeProject(
  project: ProjectRecord,
  language: string | null,
): LocalizedProjectRecord {
  return {
    ...project,
    name: getLocalizedText(project.name, language) || '',
    description: getLocalizedText(project.description, language),
  };
}

function assertCreateInput(data: CreateProjectInput): void {
  if (!isPlainObject(data.name)) {
    throw new Error('invalid json name');
  }

  if (!isNonEmptyString(data.name.en)) {
    throw new Error('name.en is required');
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

  if (
    data.description !== undefined &&
    data.description !== null &&
    !isNonEmptyString(data.description.en)
  ) {
    throw new Error('description.en is required');
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

  if (hasBudget && !isNonNegativeFiniteNumber(data.budget as number)) {
    throw new Error('invalid budget');
  }

  if (hasSpent && !isNonNegativeFiniteNumber(data.spent as number)) {
    throw new Error('invalid spent');
  }
}

export const projectService = {
  create: async (
    data: CreateProjectInput,
    language: string | null = null,
  ): Promise<LocalizedProjectRecord> => {
    assertCreateInput(data);

    try {
      const code = buildProjectCode(data.name);

      if (await projectRepository.findByCode(code, data.domainId)) {
        throw new Error('duplicate code');
      }

      const existingCategory = await projectCategoryRepository.findById(
        data.projectCategoryId,
        data.domainId,
      );

      if (!existingCategory) {
        throw new Error('not found');
      }

      const project = await projectRepository.create({
        ...data,
        code,
        searchText: buildProjectSearchText(data.name),
      });

      return normalizeProject(project, language);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  getAll: async (
    domainId: string,
    searchKey?: string,
    language: string | null = null,
  ): Promise<LocalizedProjectRecord[]> => {
    if (!isNonEmptyString(domainId)) {
      throw new Error('invalid domainId');
    }

    try {
      const projects = await projectRepository.findMany(domainId, searchKey);
      return projects.map((project) => normalizeProject(project, language));
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  getById: async (
    id: string,
    domainId: string,
    language: string | null = null,
  ): Promise<LocalizedProjectRecord | null> => {
    if (!isNonEmptyString(id) || !isNonEmptyString(domainId)) {
      throw new Error('invalid ids');
    }

    try {
      const project = await projectRepository.findById(id, domainId);
      return project ? normalizeProject(project, language) : null;
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  update: async (
    id: string,
    domainId: string,
    data: UpdateProjectInput,
    language: string | null = null,
  ): Promise<LocalizedProjectRecord | null> => {
    if (!isNonEmptyString(id) || !isNonEmptyString(domainId)) {
      throw new Error('invalid ids');
    }

    assertUpdateInput(data);

    try {
      const existingProject = await projectRepository.findById(id, domainId);

      if (!existingProject) {
        throw new Error('not found');
      }

      const updateData = {
        ...data,
        ...(data.name !== undefined
          ? {
              ...(data.name !== undefined && {
                code: buildProjectCode(data.name),
              }),
              searchText: buildProjectSearchText(data.name),
            }
          : {}),
      };

      if (updateData.code && updateData.code !== existingProject.code) {
        const duplicateProject = await projectRepository.findByCode(
          updateData.code,
          domainId,
        );

        if (duplicateProject && duplicateProject.id !== id) {
          throw new Error('duplicate code');
        }
      }

      const project = await projectRepository.update(id, domainId, updateData);
      return project ? normalizeProject(project, language) : null;
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
