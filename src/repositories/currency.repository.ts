import prisma from '../infra/database/prisma/prisma.client.js';

export const CurrencyRepository = {
  findById(id: string) {
    return prisma.currency.findFirst({
      where: { id, isDeleted: false },
      select: {
        id: true,
        name: true,
        code: true,
        symbol: true,
        flag: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  findActiveByCode(code: string) {
    return prisma.currency.findFirst({
      where: { code, isDeleted: false },
      select: {
        id: true,
        name: true,
        code: true,
        symbol: true,
        flag: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  findActiveById(
    id: string,
    options: { select?: any; transaction?: any } = {},
  ) {
    return options?.transaction
      ? options.transaction.currency.findFirst({
          where: { id, isDeleted: false },
          ...(options.select ? { select: options.select } : {}),
        })
      : prisma.currency.findFirst({
          where: { id, isDeleted: false },
          ...(options.select ? { select: options.select } : {}),
        });
  },

  findDuplicateCode(code: string, id: string) {
    return prisma.currency.findFirst({
      where: { code, isDeleted: false, id: { not: id } },
      select: {
        id: true,
        name: true,
        code: true,
        symbol: true,
        flag: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  create(
    data: {
      name: any;
      code: string;
      searchText: string;
      symbol: string;
      flag: string;
    },
    options: { transaction?: any } = {},
  ) {
    return options?.transaction
      ? options.transaction.currency.create({ data })
      : prisma.currency.create({ data });
  },

  listActive(
    limit: number,
    offset: number,
    options: {
      filters?: { searchKey?: string; status?: string };
      select?: any;
    } = {},
  ) {
    const whereClause: any = {
      isDeleted: false,
      ...(options.filters && {
        ...(options.filters.searchKey && {
          searchText: {
            contains: options.filters.searchKey,
            mode: 'insensitive',
          },
        }),
        ...(options.filters.status && { status: options.filters.status }),
      }),
    };
    return prisma.$transaction([
      prisma.currency.count({
        where: whereClause,
      }),
      prisma.currency.findMany({
        where: whereClause,
        ...(options.select
          ? { select: options.select }
          : {
              select: {
                id: true,
                name: true,
                code: true,
                symbol: true,
                flag: true,
                status: true,
                createdAt: true,
                updatedAt: true,
              },
            }),
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
    return prisma.currency.update({ where: { id }, data });
  },

  softDelete(id: string) {
    return prisma.currency.update({
      where: { id },
      data: { isDeleted: true },
    });
  },

  validateCurrencies(ids: string[]) {
    if (ids.length === 0) {
      return true;
    }
    return prisma.currency
      .count({
        where: { id: { in: ids }, isDeleted: false },
      })
      .then((count) => count === ids.length);
  },
};
