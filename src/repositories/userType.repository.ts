import { Prisma } from '@infra/database/prisma/generated/prisma/client/client';
import type { IndustryEnum } from '@infra/database/prisma/generated/prisma/client/enums';
import prisma from '@/infra/database/prisma/prisma.client';

export const userTypeRepository = {
  findDuplicate(industryType: IndustryEnum, code: string, excludeId?: string) {
    return prisma.userType.findFirst({
      where: {
        industryType,
        code,
        isDeleted: false,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    });
  },

  create(data: Prisma.UserTypeUncheckedCreateInput) {
    return prisma.userType.create({ data });
  },

  findById(id: string) {
    return prisma.userType.findFirst({ where: { id, isDeleted: false } });
  },

  list(
    limit: number,
    offset: number,
    filter?: { industryType?: IndustryEnum; searchKey?: string },
  ) {
    const searchKey = filter?.searchKey?.trim() || '';
    const where: Prisma.UserTypeWhereInput = {
      isDeleted: false,
      ...(filter?.industryType ? { industryType: filter.industryType } : {}),
      ...(searchKey
        ? { code: { contains: searchKey, mode: 'insensitive' } }
        : {}),
    };

    return prisma.$transaction([
      prisma.userType.count({ where }),
      prisma.userType.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
    ]);
  },

  update(id: string, data: Prisma.UserTypeUncheckedUpdateInput) {
    return prisma.userType.update({ where: { id }, data });
  },

  softDelete(id: string) {
    return prisma.userType.update({
      where: { id },
      data: { isDeleted: true },
    });
  },
};
