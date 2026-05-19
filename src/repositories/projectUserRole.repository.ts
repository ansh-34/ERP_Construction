import prisma from '../infra/database/prisma/prisma.client.js';
import type { StatusEnum } from '../infra/database/prisma/generated/prisma/client/enums.js';

const includeRelations = {
  project: {
    select: { id: true, name: true, code: true },
  },
  user: {
    select: { id: true, name: true, email: true },
  },
  role: {
    select: { id: true, name: true, code: true },
  },
};

export const ProjectUserRoleRepository = {
  create(data: {
    projectId: string;
    userId: string;
    roleId: string;
    domainId: string;
  }) {
    return prisma.projectUserRole.create({
      data,
      include: includeRelations,
    });
  },

  findByIdAndDomain(id: string, domainId: string) {
    return prisma.projectUserRole.findFirst({
      where: { id, domainId, isDeleted: false },
      include: includeRelations,
    });
  },

  findByProjectUserAndRole(
    projectId: string,
    userId: string,
    roleId: string,
    domainId: string,
  ) {
    return prisma.projectUserRole.findFirst({
      where: { projectId, userId, roleId, domainId, isDeleted: false },
    });
  },

  listByDomain(
    domainId: string,
    limit: number,
    offset: number,
    filters: {
      projectId?: string;
      userId?: string;
      roleId?: string;
      status?: 'ACTIVE' | 'INACTIVE';
    },
  ) {
    const where: any = { domainId, isDeleted: false };
    if (filters.projectId) where.projectId = filters.projectId;
    if (filters.userId) where.userId = filters.userId;
    if (filters.roleId) where.roleId = filters.roleId;
    if (filters.status) where.status = filters.status;

    return prisma.$transaction([
      prisma.projectUserRole.count({ where }),
      prisma.projectUserRole.findMany({
        where,
        include: includeRelations,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
    ]);
  },

  update(id: string, data: { roleId?: string; status?: StatusEnum }) {
    return prisma.projectUserRole.update({
      where: { id },
      data,
      include: includeRelations,
    });
  },

  softDelete(id: string) {
    return prisma.projectUserRole.update({
      where: { id },
      data: { isDeleted: true },
    });
  },
};
