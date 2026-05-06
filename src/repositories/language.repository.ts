import prisma from '../infra/database/prisma/prisma.client.js';

export const LanguageRepository = {
  findActiveByCode(code: string) {
    return prisma.language.findFirst({ where: { code, isDeleted: false } });
  },

  create(data: { name: string; code: string }) {
    return prisma.language.create({ data });
  },

  listActive(limit: number, offset: number) {
    return prisma.$transaction([
      prisma.language.count({ where: { isDeleted: false } }),
      prisma.language.findMany({
        where: { isDeleted: false },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
    ]);
  },
};
