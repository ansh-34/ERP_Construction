import { Messages, StatusEnum } from '../../../constants/index.js';
import {
  projectRepository,
  projectCategoryRepository,
  ProjectUserRoleRepository,
} from '../../../repositories/index.js';
import { normalizePagination } from '../../../utils/pagination.js';

export const UserProjectService = {
  localizeName(value: any, langCode: string) {
    if (!value || typeof value !== 'object') return '';
    return value[langCode] || value.en || '';
  },

  localizeProject(project: any, langCode: string) {
    return {
      ...project,
      name: UserProjectService.localizeName(project.name, langCode),
      description: UserProjectService.localizeName(
        project.description,
        langCode,
      ),
    };
  },

  async createProject(
    domainId: string,
    data: {
      name: Record<string, string>;
      projectCategoryId: string;
      description?: Record<string, string>;
      budget: number;
      spent?: number;
      locationId: string;
      status?: string;
    },
  ) {
    const incomingLanguageCodes: string[] = Object.keys(data.name || {});
    if (!incomingLanguageCodes.includes('en')) {
      throw new Error(Messages.USER_PROJECT.NAME_EN_REQUIRED);
    }

    const existingCategory = await projectCategoryRepository.findById(
      data.projectCategoryId,
      domainId,
    );

    if (!existingCategory) {
      throw new Error(Messages.USER_PROJECT.CATEGORY_NOT_FOUND);
    }

    const code = data.name.en.toString().toUpperCase().replace(/\s+/g, '_');

    const existing = await projectRepository.findByCode(code, domainId);
    if (existing) {
      throw new Error(Messages.USER_PROJECT.CODE_ALREADY_EXISTS);
    }

    return projectRepository.create({
      ...data,
      code,
      domainId,
      status: (data.status as StatusEnum) ?? StatusEnum.ACTIVE,
    });
  },

  async getProjectById(
    domainId: string,
    id: string,
    language: string | null = null,
  ) {
    const project: any = await projectRepository.findById(id, domainId);
    if (!project) {
      throw new Error(Messages.USER_PROJECT.NOT_FOUND);
    }

    if (language) {
      return UserProjectService.localizeProject(project, language);
    }

    return project;
  },

  async getMyProjects(
    domainId: string,
    userId: string,
    query: {
      offset?: number | string;
      limit?: number | string;
      status?: string;
      [key: string]: any;
    },
    langCode: string,
  ) {
    const { offset, limit } = normalizePagination(query);

    const [, assignments] = await ProjectUserRoleRepository.listByDomain(
      domainId,
      1000,
      0,
      { userId, status: 'ACTIVE' },
    );

    const projectIds = assignments.map((a) => a.projectId);

    if (projectIds.length === 0) {
      return {
        projects: [],
        pagination: { totalCount: 0, offset, limit },
      };
    }

    const allProjects = await projectRepository.findManyByIds(
      projectIds,
      domainId,
    );

    // Apply status filter if provided
    let filtered = allProjects;
    if (query.status) {
      filtered = allProjects.filter(
        (p) => p.status.toLowerCase() === query.status!.toLowerCase(),
      );
    }

    const total = filtered.length;
    const paginated = filtered.slice(offset, offset + limit);

    const localizedProjects = paginated.map((p) =>
      UserProjectService.localizeProject(p, langCode),
    );

    return {
      projects: localizedProjects,
      pagination: { totalCount: total, offset, limit },
    };
  },

  async listDomainProjects(
    domainId: string,
    query: {
      offset?: number | string;
      limit?: number | string;
      status?: string;
      [key: string]: any;
    },
    langCode: string,
  ) {
    const { offset, limit } = normalizePagination(query);

    const allProjects = await projectRepository.findMany(domainId);

    // Apply status filter if provided
    let filtered = allProjects;
    if (query.status) {
      filtered = allProjects.filter(
        (p) => p.status.toLowerCase() === query.status!.toLowerCase(),
      );
    }

    const total = filtered.length;
    const paginated = filtered.slice(offset, offset + limit);

    const localizedProjects = paginated.map((p) =>
      UserProjectService.localizeProject(p, langCode),
    );

    return {
      projects: localizedProjects,
      pagination: { totalCount: total, offset, limit },
    };
  },

  async updateProject(domainId: string, id: string, data: any) {
    const project = await projectRepository.findById(id, domainId);
    if (!project) {
      throw new Error(Messages.USER_PROJECT.NOT_FOUND);
    }

    if (data?.name) {
      const incomingLanguageCodes: string[] = Object.keys(data.name);
      if (!incomingLanguageCodes.includes('en')) {
        throw new Error(Messages.USER_PROJECT.NAME_EN_REQUIRED);
      }
    }

    return projectRepository.update(id, domainId, data);
  },

  async deleteProject(domainId: string, id: string) {
    const project = await projectRepository.findById(id, domainId);
    if (!project) {
      throw new Error(Messages.USER_PROJECT.NOT_FOUND);
    }

    return projectRepository.softDelete(id, domainId);
  },
};
