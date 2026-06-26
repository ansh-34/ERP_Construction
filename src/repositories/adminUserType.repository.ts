import { Prisma } from '@infra/database/prisma/generated/prisma/client/client';
import prisma from '@/infra/database/prisma/prisma.client';

export const adminUserTypeRepository = {
  findDuplicate(adminId: string, code: string, excludeId?: string) {
    return prisma.adminUserType.findFirst({
      where: {
        adminId,
        code,
        isDeleted: false,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    });
  },

  create(data: Prisma.AdminUserTypeUncheckedCreateInput) {
    return prisma.adminUserType.create({ data });
  },

  findActiveByCodeAndAdmin(code: string, adminId: string) {
    return prisma.adminUserType.findFirst({
      where: {
        code,
        adminId,
        status: 'ACTIVE',
        isDeleted: false,
      },
    });
  },

  findActiveByCodesAndAdmin(codes: string[], adminId: string) {
    return prisma.adminUserType.findMany({
      where: {
        code: { in: codes },
        adminId,
        status: 'ACTIVE',
        isDeleted: false,
      },
    });
  },

  findByIdAndAdmin(id: string, adminId: string) {
    return prisma.adminUserType.findFirst({
      where: {
        id,
        adminId,
        isDeleted: false,
      },
    });
  },

  listByAdmin(
    adminId: string,
    limit: number,
    offset: number,
    filter?: { status?: 'ACTIVE' | 'INACTIVE'; searchKey?: string },
  ) {
    const searchKey = filter?.searchKey?.trim() || '';
    const where: Prisma.AdminUserTypeWhereInput = {
      adminId,
      isDeleted: false,
      ...(filter?.status ? { status: filter.status } : {}),
      ...(searchKey
        ? {
            OR: [
              { code: { contains: searchKey, mode: 'insensitive' } },
              { searchText: { contains: searchKey, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    return prisma.$transaction([
      prisma.adminUserType.count({ where }),
      prisma.adminUserType.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
    ]);
  },

  listActiveByAdmin(
    adminId: string,
    limit: number,
    offset: number,
    filter?: { searchKey?: string },
  ) {
    const searchKey = filter?.searchKey?.trim() || '';
    const where: Prisma.AdminUserTypeWhereInput = {
      adminId,
      status: 'ACTIVE',
      isDeleted: false,
      ...(searchKey && {
        OR: [
          { code: { contains: searchKey, mode: 'insensitive' } },
          { searchText: { contains: searchKey, mode: 'insensitive' } },
        ],
      }),
    };

    return prisma.$transaction([
      prisma.adminUserType.count({ where }),
      prisma.adminUserType.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
    ]);
  },

  softDelete(id: string) {
    return prisma.adminUserType.update({
      where: { id },
      data: { isDeleted: true, status: 'INACTIVE' },
    });
  },
};
