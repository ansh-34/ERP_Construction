import { Messages, StatusEnum } from '../../../constants/index.js';
import {
  projectRepository,
  DomainRepository,
  projectTaskRepository,
  projectStageRepository,
} from '../../../repositories/index.js';
import { normalizePagination } from '../../../utils/pagination.js';
import prisma from '../../../infra/database/prisma/prisma.client.js';

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
      status?: 'ACTIVE' | 'INACTIVE';
      projectStages?: {
        name: Record<string, string>;
        description?: Record<string, string>;
        progress?: number | null;
        status?: 'ACTIVE' | 'INACTIVE';
      }[];
    },
  ) {
    const incomingLanguageCodes: string[] = Object.keys(data.name || {});
    if (!incomingLanguageCodes.includes('en')) {
      throw new Error(Messages.USER_PROJECT.NAME_EN_REQUIRED);
    }

    const code = data.name.en.toString().toUpperCase().replace(/\s+/g, '_');
    const searchText = data.name.en.toString().toLowerCase();
    const projectStages = data.projectStages || [];
    const stageCodes = new Set<string>();

    for (const stage of projectStages) {
      const stageLanguageCodes = Object.keys(stage.name || {});
      if (!stageLanguageCodes.includes('en')) {
        throw new Error('project stage name.en is required');
      }

      if (stage.description) {
        const stageDescriptionLanguageCodes = Object.keys(stage.description);
        if (!stageDescriptionLanguageCodes.includes('en')) {
          throw new Error('project stage description.en is required');
        }
      }

      const stageCode = stage.name.en
        .toString()
        .toUpperCase()
        .replace(/\s+/g, '_');

      if (stageCodes.has(stageCode)) {
        throw new Error('duplicate project stage code');
      }

      stageCodes.add(stageCode);
    }

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

    const { project } = await prisma.$transaction(async (tx: any) => {
      const createdProject = await projectRepository.create(
        {
          ...data,
          code,
          searchText,
          domainId,
          adminId: resolvedAdminId,
          status: (data.status as StatusEnum) ?? StatusEnum.ACTIVE,
        },
        { transaction: tx },
      );

      if (projectStages.length) {
        await projectStageRepository.bulkCreate(
          projectStages.map((stage) => {
            const stageCode = stage.name.en
              .toString()
              .toUpperCase()
              .replace(/\s+/g, '_');

            return {
              name: stage.name,
              code: stageCode,
              searchText: Object.values(stage.name).join(' ').toLowerCase(),
              description: stage.description || null,
              progress: stage.progress ?? null,
              projectId: createdProject.id,
              domainId,
              adminId: resolvedAdminId,
              status: (stage.status as StatusEnum) ?? StatusEnum.ACTIVE,
            };
          }),
          { transaction: tx, skipDuplicates: false },
        );
      }

      return { project: createdProject };
    });

    const createdStages = projectStages.length
      ? await projectStageRepository.findMany(
          domainId,
          project.id,
          resolvedAdminId,
        )
      : [];

    return {
      ...project,
      projectStages: createdStages,
    };
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
      status?: 'ACTIVE' | 'INACTIVE';
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
      status?: 'ACTIVE' | 'INACTIVE';
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
