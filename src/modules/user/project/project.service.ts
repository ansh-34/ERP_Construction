import { Messages, StatusEnum } from '../../../constants/index.js';
import {
  projectRepository,
  ProjectUserRoleRepository,
  DomainRepository,
  projectTaskRepository,
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

  async resolveAdminId(domainId: string, adminId: string) {
    if (adminId) return adminId;

    const domain = await DomainRepository.findActiveById(domainId);
    if (!domain?.adminId) {
      throw new Error(Messages.DOMAIN.NOT_FOUND);
    }

    return domain.adminId;
  },

  async createProject(
    domainId: string,
    adminId: string,
    data: {
      name: Record<string, string>;
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

    const code = data.name.en.toString().toUpperCase().replace(/\s+/g, '_');
    const searchText = data.name.en.toString().toLowerCase();

    const resolvedAdminId = await UserProjectService.resolveAdminId(
      domainId,
      adminId,
    );

    const existing = await projectRepository.findByCode(
      code,
      domainId,
      resolvedAdminId,
    );
    if (existing) {
      throw new Error(Messages.USER_PROJECT.CODE_ALREADY_EXISTS);
    }

    return projectRepository.create({
      ...data,
      code,
      searchText,
      domainId,
      adminId: resolvedAdminId,
      status: (data.status as StatusEnum) ?? StatusEnum.ACTIVE,
    });
  },

  async getProjectById(
    domainId: string,
    adminId: string,
    id: string,
    language: string | null = null,
  ) {
    const resolvedAdminId = await UserProjectService.resolveAdminId(
      domainId,
      adminId,
    );
    const project: any = await projectRepository.findById(
      id,
      domainId,
      resolvedAdminId,
    );
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
    adminId: string,
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
    const resolvedAdminId = await UserProjectService.resolveAdminId(
      domainId,
      adminId,
    );

    const projectIds = await projectTaskRepository.findProjectIdsByAssignee(
      domainId,
      userId,
      resolvedAdminId,
    );

    if (projectIds.length === 0) {
      return {
        projects: [],
        pagination: { totalCount: 0, offset, limit },
      };
    }

    const allProjects = await projectRepository.findManyByIds(
      projectIds,
      domainId,
      resolvedAdminId,
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
    adminId: string,
    query: {
      offset?: number | string;
      limit?: number | string;
      status?: string;
      [key: string]: any;
    },
    langCode: string,
  ) {
    const { offset, limit } = normalizePagination(query);
    const resolvedAdminId = await UserProjectService.resolveAdminId(
      domainId,
      adminId,
    );

    const allProjects = await projectRepository.findMany(
      domainId,
      undefined,
      resolvedAdminId,
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

  async updateProject(
    domainId: string,
    adminId: string,
    id: string,
    data: any,
  ) {
    const resolvedAdminId = await UserProjectService.resolveAdminId(
      domainId,
      adminId,
    );
    const project = await projectRepository.findById(
      id,
      domainId,
      resolvedAdminId,
    );
    if (!project) {
      throw new Error(Messages.USER_PROJECT.NOT_FOUND);
    }

    if (data?.name) {
      const incomingLanguageCodes: string[] = Object.keys(data.name);
      if (!incomingLanguageCodes.includes('en')) {
        throw new Error(Messages.USER_PROJECT.NAME_EN_REQUIRED);
      }
    }

    return projectRepository.update(id, domainId, data, resolvedAdminId);
  },

  async deleteProject(domainId: string, adminId: string, id: string) {
    const resolvedAdminId = await UserProjectService.resolveAdminId(
      domainId,
      adminId,
    );
    const project = await projectRepository.findById(
      id,
      domainId,
      resolvedAdminId,
    );
    if (!project) {
      throw new Error(Messages.USER_PROJECT.NOT_FOUND);
    }

    return projectRepository.softDelete(id, domainId, resolvedAdminId);
  },
};
