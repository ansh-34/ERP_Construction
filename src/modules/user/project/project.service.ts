import { Messages, StatusEnum } from '../../../constants/index.js';
import {
  projectRepository,
  DomainRepository,
  projectTaskRepository,
  projectStageRepository,
} from '../../../repositories/index.js';
import { normalizePagination } from '../../../utils/pagination.js';
import { transaction } from '@/infra/database/prisma/transaction.js';

export const UserProjectService = {
  localizeName(value: any, langCode: string | null | undefined) {
    if (!value || typeof value !== 'object') return '';
    if (!langCode) return value;
    return value[langCode] || value.en || '';
  },

  localizeDescription(value: unknown, langCode: string | null | undefined) {
    if (value === null || value === undefined) return null;

    if (typeof value === 'object' && !Array.isArray(value)) {
      return UserProjectService.localizeName(value, langCode);
    }

    if (typeof value !== 'string') return String(value);

    try {
      const parsed = JSON.parse(value) as unknown;

      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return UserProjectService.localizeName(parsed, langCode);
      }
    } catch {
      // Value is already a plain single-line description.
    }

    return value;
  },

  localizeProject(project: any, langCode: string | null | undefined) {
    const projectData = { ...project };
    delete projectData.location;
    delete projectData.domain;
    delete projectData.admin;

    return {
      ...projectData,
      name: UserProjectService.localizeName(project.name, langCode),
      description: UserProjectService.localizeDescription(
        project.description,
        langCode,
      ),
    };
  },

  localizeProjectStage(stage: any, langCode: string | null | undefined) {
    const stageData = { ...stage };
    delete stageData.project;
    delete stageData.domain;
    delete stageData.admin;

    return {
      ...stageData,
      name: UserProjectService.localizeName(stage.name, langCode),
      description: UserProjectService.localizeDescription(
        stage.description,
        langCode,
      ),
    };
  },

  parseOptionalDate(value: string | Date | null | undefined, field: string) {
    if (value === undefined) return undefined;
    if (value === null) return null;

    if (value instanceof Date) {
      if (Number.isNaN(value.getTime())) {
        throw new Error(`invalid ${field}`);
      }

      return value;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new Error(`invalid ${field}`);
    }

    return date;
  },

  ensureDateRange(
    startDate: Date | null | undefined,
    endDate: Date | null | undefined,
    startField: string,
    endField: string,
  ) {
    if (startDate && endDate && endDate.getTime() < startDate.getTime()) {
      throw new Error(`${endField} cannot be before ${startField}`);
    }
  },

  assertSingleLineDescription(value: string | null | undefined, field: string) {
    if (value === undefined || value === null) return;

    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new Error(`${field} is required`);
    }

    if (/[\r\n]/.test(value)) {
      throw new Error(`${field} must be single-line`);
    }
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
      description?: string | null;
      budget: number;
      spent?: number;
      expectedStartDate?: string;
      expectedEndDate?: string;
      locationId: string;
      status?: 'ACTIVE' | 'INACTIVE';
      projectStages?: {
        name: Record<string, string>;
        description?: string | null;
        progress?: number | null;
        expectedStartDate?: string;
        expectedEndDate?: string;
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
    UserProjectService.assertSingleLineDescription(
      data.description,
      'description',
    );
    UserProjectService.ensureDateRange(
      UserProjectService.parseOptionalDate(
        data.expectedStartDate,
        'expectedStartDate',
      ),
      UserProjectService.parseOptionalDate(
        data.expectedEndDate,
        'expectedEndDate',
      ),
      'expectedStartDate',
      'expectedEndDate',
    );

    for (const stage of projectStages) {
      const stageLanguageCodes = Object.keys(stage.name || {});
      if (!stageLanguageCodes.includes('en')) {
        throw new Error('project stage name.en is required');
      }

      UserProjectService.assertSingleLineDescription(
        stage.description,
        'project stage description',
      );

      const stageCode = stage.name.en
        .toString()
        .toUpperCase()
        .replace(/\s+/g, '_');

      if (stageCodes.has(stageCode)) {
        throw new Error('duplicate project stage code');
      }

      UserProjectService.ensureDateRange(
        UserProjectService.parseOptionalDate(
          stage.expectedStartDate,
          'project stage expectedStartDate',
        ),
        UserProjectService.parseOptionalDate(
          stage.expectedEndDate,
          'project stage expectedEndDate',
        ),
        'project stage expectedStartDate',
        'project stage expectedEndDate',
      );

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

    const { project } = await transaction(async (tx) => {
      const createdProject = await projectRepository.create(
        {
          ...data,
          expectedStartDate: UserProjectService.parseOptionalDate(
            data.expectedStartDate,
            'expectedStartDate',
          ),
          expectedEndDate: UserProjectService.parseOptionalDate(
            data.expectedEndDate,
            'expectedEndDate',
          ),
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
              progress: 0,
              expectedStartDate: UserProjectService.parseOptionalDate(
                stage.expectedStartDate,
                'project stage expectedStartDate',
              ),
              expectedEndDate: UserProjectService.parseOptionalDate(
                stage.expectedEndDate,
                'project stage expectedEndDate',
              ),
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
      projectStages: createdStages.map((stage) =>
        UserProjectService.localizeProjectStage(stage, 'en'),
      ),
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

    if (data.description !== undefined) {
      UserProjectService.assertSingleLineDescription(
        data.description,
        'description',
      );
    }

    const updateData = {
      ...data,
      ...(data.actualStartDate !== undefined && {
        actualStartDate: UserProjectService.parseOptionalDate(
          data.actualStartDate,
          'actualStartDate',
        ),
      }),
      ...(data.actualEndDate !== undefined && {
        actualEndDate: UserProjectService.parseOptionalDate(
          data.actualEndDate,
          'actualEndDate',
        ),
      }),
    };

    UserProjectService.ensureDateRange(
      updateData.actualStartDate,
      updateData.actualEndDate,
      'actualStartDate',
      'actualEndDate',
    );

    return projectRepository.update(id, domainId, updateData, resolvedAdminId);
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
