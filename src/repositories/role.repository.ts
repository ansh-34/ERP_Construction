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

  findAdminByDomain(domainId: string) {
    return prisma.role.findFirst({
      where: { domainId, code: 'admin' },
    });
  },

  create(data: { name: any; code: string; level: number; domainId: string }) {
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
