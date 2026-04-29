import prisma from '../infra/database/prisma/prisma.client.js';

export const ModuleRepository = {
  findActiveByCode(code: string) {
    return prisma.module.findFirst({ where: { code, isDeleted: false } });
  },

  findActiveById(id: string) {
    return prisma.module.findFirst({ where: { id, isDeleted: false } });
  },

  findDuplicateCode(code: string, id: string) {
    return prisma.module.findFirst({
      where: { code, isDeleted: false, id: { not: id } },
    });
  },

  create(data: { name: any; code: string }) {
    return prisma.module.create({ data });
  },

  listActive(limit: number, offset: number) {
    return prisma.$transaction([
      prisma.module.count({ where: { isDeleted: false } }),
      prisma.module.findMany({
        where: { isDeleted: false },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
    ]);
  },

  update(id: string, data: { name?: any; code?: string; status?: string }) {
    return prisma.module.update({ where: { id }, data });
  },

  softDelete(id: string) {
    return prisma.module.update({
      where: { id },
      data: { isDeleted: true },
    });
  },
};
