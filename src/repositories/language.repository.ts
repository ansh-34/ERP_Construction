import prisma from '../infra/database/prisma/prisma.client.js';

export const LanguageRepository = {
  findById(id: string) {
    return prisma.language.findFirst({
      where: { id, isDeleted: false },
      select: {
        id: true,
        name: true,
        code: true,
        flag: true,
        dir: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  findByName(name: string) {
    return prisma.language.findFirst({ where: { name, isDeleted: false } });
  },

  findActiveByCode(code: string) {
    return prisma.language.findFirst({ where: { code, isDeleted: false } });
  },

  create(data: {
    name: string;
    code: string;
    flag: string;
    dir: 'ltr' | 'rtl';
  }) {
    return prisma.language.create({ data });
  },

  listActive(
    limit: number,
    offset: number,
    options: { select?: any; transaction?: any; filters?: any } = {},
  ) {
    const prismaClient = options?.transaction || prisma;

    const whereClause = {
      isDeleted: false,
      ...(options.filters && {
        ...(options.filters.searchKey && {
          OR: [
            {
              name: {
                contains: options.filters.searchKey,
                mode: 'insensitive',
              },
            },
            {
              code: {
                contains: options.filters.searchKey,
                mode: 'insensitive',
              },
            },
          ],
        }),
        ...(options.filters.status && {
          status: options.filters.status,
        }),
        ...(options.filters.code && {
          code: options.filters.code,
        }),
      }),
    };

    return prismaClient.$transaction([
      prisma.language.count({ where: whereClause }),
      prisma.language.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        select: options?.select || {
          id: true,
          name: true,
          code: true,
          status: true,
          dir: true,
          flag: true,
          createdAt: true,
          updatedAt: true,
        },
        skip: offset,
        take: limit,
      }),
    ]);
  },

  update(id: string, data: { name?: string; code?: string }) {
    return prisma.language.update({
      where: { id },
      data,
    });
  },

  softDelete(id: string) {
    return prisma.language.update({
      where: { id },
      data: { isDeleted: true },
    });
  },
};
