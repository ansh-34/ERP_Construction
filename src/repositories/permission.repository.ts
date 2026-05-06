import prisma from '../infra/database/prisma/prisma.client.js';

export const PermissionRepository = {
  findActiveByCode(code: string) {
    return prisma.permission.findFirst({ where: { code, isDeleted: false } });
  },

  findActiveById(id: string) {
    return prisma.permission.findFirst({ where: { id, isDeleted: false } });
  },

  findDuplicateCode(code: string, id: string) {
    return prisma.permission.findFirst({
      where: { code, isDeleted: false, id: { not: id } },
    });
  },

  listActiveCodes() {
    return prisma.permission.findMany({
      where: { isDeleted: false },
      select: { code: true },
    });
  },

  create(data: { name: any; code: string }) {
    return prisma.permission.create({ data });
  },

  listActive(limit: number, offset: number) {
    return prisma.$transaction([
      prisma.permission.count({ where: { isDeleted: false } }),
      prisma.permission.findMany({
        where: { isDeleted: false },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
    ]);
  },

  update(id: string, data: { name?: any; code?: string; status?: string }) {
    return prisma.permission.update({ where: { id }, data });
  },

  softDelete(id: string) {
    return prisma.permission.update({
      where: { id },
      data: { isDeleted: true },
    });
  },
};
