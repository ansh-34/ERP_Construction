import {
  projectRepository,
  DomainRepository,
  type ProjectRecord,
  type UpdateProjectInput,
} from '@repositories/index';
import { StatusEnum } from '@constants/index';
import { normalizePrismaError } from '@/utils/prismaError';
import { normalizePagination, type PaginationQuery } from '@/utils/pagination';
import {
  isNonEmptyString,
  isPlainObject,
  isNonNegativeFiniteNumber,
} from '@/utils/validation';

export interface CreateProjectInput {
  name: Record<string, unknown>;
  description?: Record<string, unknown> | null;
  budget: number;
  spent?: number;
  locationId: string;
  domainId: string;
  adminId: string;
  status: StatusEnum;
}

type LocalizedProjectRecord = Omit<ProjectRecord, 'name' | 'description'> & {
  name: string;
  description: string | null;
};

type PaginatedProjects = {
  projects: LocalizedProjectRecord[];
  pagination: {
    totalCount: number;
    offset: number;
    limit: number;
  };
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
  const hasLocationId = data.locationId !== undefined;
  const hasStatus = data.status !== undefined;

  if (
    !hasName &&
    !hasDescription &&
    !hasBudget &&
    !hasSpent &&
    !hasLocationId &&
    !hasStatus
  ) {
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

  if (hasLocationId && !isNonEmptyString(data.locationId)) {
    throw new Error('invalid locationId');
  }
}

async function resolveAdminId(domainId: string, adminId: string) {
  if (adminId) return adminId;

  const domain = await DomainRepository.findActiveById(domainId);
  if (!domain?.adminId) {
    throw new Error('invalid adminId');
  }

  return domain.adminId;
}

export const projectService = {
  create: async (
    data: CreateProjectInput,
    language: string | null = null,
  ): Promise<LocalizedProjectRecord> => {
    assertCreateInput(data);

    try {
      const code = buildProjectCode(data.name);
      const adminId = await resolveAdminId(data.domainId, data.adminId);

      if (await projectRepository.findByCode(code, data.domainId, adminId)) {
        throw new Error('duplicate code');
      }

      const project = await projectRepository.create({
        ...data,
        adminId,
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
    adminId: string,
    searchKey?: string,
    paginationQuery: PaginationQuery = {},
    language: string | null = null,
  ): Promise<PaginatedProjects> => {
    if (!isNonEmptyString(domainId)) {
      throw new Error('invalid domainId');
    }

    try {
      const { offset, limit } = normalizePagination(paginationQuery);
      const resolvedAdminId = await resolveAdminId(domainId, adminId);
      const projects = await projectRepository.findMany(
        domainId,
        searchKey,
        resolvedAdminId,
      );
      const paginatedProjects = projects.slice(offset, offset + limit);

      return {
        projects: paginatedProjects.map((project) =>
          normalizeProject(project, language),
        ),
        pagination: {
          totalCount: projects.length,
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
  ): Promise<LocalizedProjectRecord | null> => {
    if (!isNonEmptyString(id) || !isNonEmptyString(domainId)) {
      throw new Error('invalid ids');
    }

    try {
      const resolvedAdminId = await resolveAdminId(domainId, adminId);
      const project = await projectRepository.findById(
        id,
        domainId,
        resolvedAdminId,
      );
      return project ? normalizeProject(project, language) : null;
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  update: async (
    id: string,
    domainId: string,
    adminId: string,
    data: UpdateProjectInput,
    language: string | null = null,
  ): Promise<LocalizedProjectRecord | null> => {
    if (!isNonEmptyString(id) || !isNonEmptyString(domainId)) {
      throw new Error('invalid ids');
    }

    assertUpdateInput(data);

    try {
      const resolvedAdminId = await resolveAdminId(domainId, adminId);
      const existingProject = await projectRepository.findById(
        id,
        domainId,
        resolvedAdminId,
      );

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
          resolvedAdminId,
        );

        if (duplicateProject && duplicateProject.id !== id) {
          throw new Error('duplicate code');
        }
      }

      const project = await projectRepository.update(
        id,
        domainId,
        updateData,
        resolvedAdminId,
      );
      return project ? normalizeProject(project, language) : null;
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  softDelete: async (
    id: string,
    domainId: string,
    adminId: string,
  ): Promise<ProjectRecord | null> => {
    if (!isNonEmptyString(id) || !isNonEmptyString(domainId)) {
      throw new Error('invalid ids');
    }

    try {
      const resolvedAdminId = await resolveAdminId(domainId, adminId);
      const existingProject = await projectRepository.findById(
        id,
        domainId,
        resolvedAdminId,
      );

      if (!existingProject) {
        throw new Error('not found');
      }

      return await projectRepository.softDelete(id, domainId, resolvedAdminId);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },
};
