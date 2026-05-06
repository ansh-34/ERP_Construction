import prisma from '../infra/database/prisma/prisma.client.js';

export const LanguageRepository = {
  findById(id: string) {
    return prisma.language.findFirst({ where: { id, isDeleted: false } });
  },

  findByName(name: string) {
    return prisma.language.findFirst({ where: { name, isDeleted: false } });
  },

  findActiveByCode(code: string) {
    return prisma.language.findFirst({ where: { code, isDeleted: false } });
  },

  create(data: { name: string; code: string }) {
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
      }),
    };

    return prismaClient.$transaction([
      prisma.language.count({ where: whereClause }),
      prisma.language.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          code: true,
          status: true,
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
