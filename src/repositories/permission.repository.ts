import prisma from '../infra/database/prisma/prisma.client.js';

export const PermissionRepository = {
  findActiveByCode(code: string) {
    return prisma.permission.findFirst({ where: { code, isDeleted: false } });
  },

  findActiveById(id: string) {
    return prisma.permission.findFirst({
      where: { id, isDeleted: false },
      select: {
        id: true,
        name: true,
        code: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
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

  create(data: { name: any; code: string; searchText: string }) {
    return prisma.permission.create({ data });
  },

  listActive(
    limit: number,
    offset: number,
    options: {
      filter?: { searchKey?: string; status?: 'ACTIVE' | 'INACTIVE' };
      transaction?: any;
    } = {},
  ) {
    const prismaClient = options?.transaction || prisma;

    const whereClause = {
      isDeleted: false,
      ...(options.filter?.searchKey && {
        searchText: {
          contains: options.filter.searchKey,
          mode: 'insensitive',
        },
      }),
      ...(options.filter?.status && { status: options.filter.status }),
    };

    return prismaClient.$transaction([
      prismaClient.permission.count({ where: whereClause }),
      prismaClient.permission.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
        select: {
          id: true,
          name: true,
          code: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);
  },

  update(
    id: string,
    data: { name?: any; code?: string; status?: 'ACTIVE' | 'INACTIVE' },
  ) {
    return prisma.permission.update({ where: { id }, data });
  },

  softDelete(id: string) {
    return prisma.permission.update({
      where: { id },
      data: { isDeleted: true },
    });
  },

  validatePermissionIds(ids: string[]) {
    if (ids.length === 0) {
      return true;
    }
    return prisma.permission
      .count({
        where: { id: { in: ids }, isDeleted: false },
      })
      .then((count) => count === ids.length);
  },
};
