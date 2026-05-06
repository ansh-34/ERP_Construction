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
    data: {
      name: any;
      code: string;
      searchText: string;
      parentDependenciesCount: number;
      activeParentDependenciesCount: number;
    },
    options: { transaction?: any } = {},
  ) {
    return options?.transaction
      ? options.transaction.module.create({ data })
      : prisma.module.create({ data });
  },

  listActive(
    limit: number,
    offset: number,
    options: {
      filter?: { searchKey?: string; status?: string };
      select?: any;
    } = {},
  ) {
    const whereClause: any = {
      isDeleted: false,
      ...(options.filter && {
        ...(options.filter.searchKey && {
          searchText: {
            contains: options.filter.searchKey,
            mode: 'insensitive',
          },
        }),
        ...(options.filter.status && { status: options.filter.status }),
      }),
    };
    return prisma.$transaction([
      prisma.module.count({
        where: whereClause,
      }),
      prisma.module.findMany({
        where: whereClause,
        ...(options.select ? { select: options.select } : {}),
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
    ]);
  },

  update(
    id: string,
    data: { name?: any; code?: string; status?: string; searchText?: string },
  ) {
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
