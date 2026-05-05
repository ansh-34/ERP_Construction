import prisma from '../infra/database/prisma/prisma.client.js';

export const ModuleRepository = {
  findActiveByCode(code: string) {
    return prisma.module.findFirst({ where: { code, isDeleted: false } });
  },

  findActiveById(
    id: string,
    options: { select?: any; transaction?: any } = {},
  ) {
    return options?.transaction
      ? options.transaction.module.findFirst({
          where: { id, isDeleted: false },
          ...(options.select ? { select: options.select } : {}),
        })
      : prisma.module.findFirst({
          where: { id, isDeleted: false },
          ...(options.select ? { select: options.select } : {}),
        });
  },

  findDuplicateCode(code: string, id: string) {
    return prisma.module.findFirst({
      where: { code, isDeleted: false, id: { not: id } },
    });
  },

  create(
    data: { name: any; code: string; searchText: string },
    options: { transaction?: any } = {},
  ) {
    return options?.transaction
      ? options.transaction.module.create({ data })
      : prisma.module.create({ data });
  },

  listActive(
    limit: number,
    offset: number,
    options: { filter?: { searchKey?: string; status?: string } } = {},
  ) {
    return prisma.$transaction([
      prisma.module.count({
        where: {
          isDeleted: false,
          ...(options.filter && {
            searchText: {
              contains: options.filter.searchKey,
              mode: 'insensitive',
            },
          }),
          ...(options.filter?.status && {
            status: options.filter.status,
          }),
        },
      }),
      prisma.module.findMany({
        where: {
          isDeleted: false,
          ...(options.filter && {
            searchText: {
              contains: options.filter.searchKey,
              mode: 'insensitive',
            },
          }),
        },
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

  validateModuleIds(ids: string[]) {
    if (ids.length === 0) {
      return true;
    }
    return prisma.module
      .count({
        where: { id: { in: ids }, isDeleted: false },
      })
      .then((count) => count === ids.length);
  },
};
