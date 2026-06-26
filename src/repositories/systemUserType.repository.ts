import { Prisma } from '@infra/database/prisma/generated/prisma/client/client';
import prisma from '@/infra/database/prisma/prisma.client';

export const systemUserTypeRepository = {
  findDuplicate(code: string, excludeId?: string) {
    return prisma.systemUserType.findFirst({
      where: {
        code,
        isDeleted: false,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    });
  },

  findActiveByCode(code: string) {
    return prisma.systemUserType.findFirst({
      where: { code, status: 'ACTIVE', isDeleted: false },
    });
  },

  findActiveByIds(ids: string[]) {
    return prisma.systemUserType.findMany({
      where: {
        id: { in: ids },
        status: 'ACTIVE',
        isDeleted: false,
      },
      orderBy: { createdAt: 'asc' },
    });
  },

  create(data: Prisma.SystemUserTypeUncheckedCreateInput) {
    return prisma.systemUserType.create({ data });
  },

  list(
    limit: number,
    offset: number,
    filter?: { status?: 'ACTIVE' | 'INACTIVE'; searchKey?: string },
  ) {
    const searchKey = filter?.searchKey?.trim() || '';
    const where: Prisma.SystemUserTypeWhereInput = {
      isDeleted: false,
      ...(filter?.status && { status: filter.status }),
      ...(searchKey && {
        OR: [
          { code: { contains: searchKey, mode: 'insensitive' } },
          { searchText: { contains: searchKey, mode: 'insensitive' } },
        ],
      }),
    };

    return prisma.$transaction([
      prisma.systemUserType.count({ where }),
      prisma.systemUserType.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
    ]);
  },

  listActive() {
    return prisma.systemUserType.findMany({
      where: { status: 'ACTIVE', isDeleted: false },
      orderBy: { createdAt: 'asc' },
    });
  },

  findById(id: string) {
    return prisma.systemUserType.findFirst({
      where: { id, isDeleted: false },
    });
  },

  update(id: string, data: Prisma.SystemUserTypeUncheckedUpdateInput) {
    return prisma.systemUserType.update({ where: { id }, data });
  },

  softDelete(id: string) {
    return prisma.systemUserType.update({
      where: { id },
      data: { isDeleted: true, status: 'INACTIVE' },
    });
  },
};
