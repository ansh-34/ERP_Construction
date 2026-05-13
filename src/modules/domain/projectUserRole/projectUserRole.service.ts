import { Messages } from '../../../constants/index.js';
import {
  ProjectUserRoleRepository,
  projectRepository,
  UserRepository,
  RoleRepository,
} from '../../../repositories/index.js';
import type { PaginationQuery } from '../../../utils/pagination.js';
import { normalizePagination } from '../../../utils/pagination.js';
import type { StatusEnum } from '../../../infra/database/prisma/generated/prisma/client/enums.js';

export const ProjectUserRoleService = {
  async assign(
    domainId: string,
    data: { projectId: string; userId: string; roleId: string },
  ) {
    const { projectId, userId, roleId } = data;

    // Verify Project
    const project = await projectRepository.findById(projectId, domainId);
    if (!project) {
      throw new Error(Messages.PROJECT_USER_ROLE.PROJECT_NOT_FOUND);
    }

    // Verify User
    const user = await UserRepository.findActiveByIdAndDomain(userId, domainId);
    if (!user) {
      throw new Error(Messages.PROJECT_USER_ROLE.USER_NOT_FOUND);
    }

    // Verify Role
    const role = await RoleRepository.findActiveByIdAndDomain(roleId, domainId);
    if (!role) {
      throw new Error(Messages.PROJECT_USER_ROLE.ROLE_NOT_FOUND);
    }

    // Check existing assignment
    const existing = await ProjectUserRoleRepository.findByProjectUserAndRole(
      projectId,
      userId,
      roleId,
      domainId,
    );

    if (existing) {
      throw new Error(Messages.PROJECT_USER_ROLE.ALREADY_ASSIGNED);
    }

    return ProjectUserRoleRepository.create({
      projectId,
      userId,
      roleId,
      domainId,
    });
  },

  async list(
    domainId: string,
    query: PaginationQuery & {
      projectId?: string;
      userId?: string;
      roleId?: string;
      status?: StatusEnum;
    },
  ) {
    const { offset, limit } = normalizePagination(query);

    const [totalCount, assignments] =
      await ProjectUserRoleRepository.listByDomain(domainId, limit, offset, {
        projectId: query.projectId,
        userId: query.userId,
        roleId: query.roleId,
        status: query.status,
      });

    return {
      assignments,
      pagination: {
        totalCount,
        offset,
        limit,
      },
    };
  },

  async listByProject(
    domainId: string,
    projectId: string,
    query: PaginationQuery,
  ) {
    return this.list(domainId, { ...query, projectId });
  },

  async listByUser(domainId: string, userId: string, query: PaginationQuery) {
    return this.list(domainId, { ...query, userId });
  },

  async getById(domainId: string, id: string) {
    const assignment = await ProjectUserRoleRepository.findByIdAndDomain(
      id,
      domainId,
    );
    if (!assignment) {
      throw new Error(Messages.PROJECT_USER_ROLE.NOT_FOUND);
    }
    return assignment;
  },

  async update(
    domainId: string,
    id: string,
    data: { roleId?: string; status?: StatusEnum },
  ) {
    const assignment = await ProjectUserRoleRepository.findByIdAndDomain(
      id,
      domainId,
    );
    if (!assignment) {
      throw new Error(Messages.PROJECT_USER_ROLE.NOT_FOUND);
    }

    if (data.roleId && data.roleId !== assignment.roleId) {
      const role = await RoleRepository.findActiveByIdAndDomain(
        data.roleId,
        domainId,
      );
      if (!role) {
        throw new Error(Messages.PROJECT_USER_ROLE.ROLE_NOT_FOUND);
      }
    }

    return ProjectUserRoleRepository.update(id, data);
  },

  async remove(domainId: string, id: string) {
    const assignment = await ProjectUserRoleRepository.findByIdAndDomain(
      id,
      domainId,
    );
    if (!assignment) {
      throw new Error(Messages.PROJECT_USER_ROLE.NOT_FOUND);
    }

    return ProjectUserRoleRepository.softDelete(id);
  },
};
