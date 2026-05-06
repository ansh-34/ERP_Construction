import prisma from '../infra/database/prisma/prisma.client.js';

export const RoleRepository = {
  findActiveByCodeAndDomain(code: string, domainId: string) {
    return prisma.role.findFirst({
      where: { code, domainId, isDeleted: false },
    });
  },

  findActiveByIdAndDomain(id: string, domainId: string) {
    return prisma.role.findFirst({
      where: { id, domainId, isDeleted: false },
    });
  },

  findDomainRoleByDomain(domainId: string) {
    return prisma.role.findFirst({
      where: { domainId, code: 'domain', isDeleted: false },
    });
  },

  create(data: {
    name: string;
    code: string;
    level: number;
    domainId: string;
  }) {
    return prisma.role.create({ data });
  },

  listByDomain(domainId: string, limit: number, offset: number) {
    return prisma.$transaction([
      prisma.role.count({ where: { domainId, isDeleted: false } }),
      prisma.role.findMany({
        where: { domainId, isDeleted: false },
        include: {
          roleModulePermissions: {
            include: { module: { select: { name: true, code: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
    ]);
  },
};
