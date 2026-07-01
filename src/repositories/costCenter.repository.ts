import { Prisma } from '@infra/database/prisma/generated/prisma/client/client';
import prisma from '../infra/database/prisma/prisma.client.js';

export const costCenterRepository = {
  create(data: Prisma.CostCenterUncheckedCreateInput) {
    return prisma.costCenter.create({ data });
  },

  listByDomain(
    domainId: string,
    adminId: string,
    limit: number,
    offset: number,
    filter?: {
      status?: 'ACTIVE' | 'INACTIVE';
      searchKey?: string;
      parentId?: string | null;
    },
  ) {
    const searchKey = filter?.searchKey?.trim() || '';
    const where: Prisma.CostCenterWhereInput = {
      domainId,
      adminId,
      isDeleted: false,
      ...(filter?.status && { status: filter.status }),
      ...(filter?.parentId !== undefined && { parentId: filter.parentId }),
      ...(searchKey && {
        searchText: { contains: searchKey, mode: 'insensitive' as const },
      }),
    };

    return prisma.$transaction([
      prisma.costCenter.count({ where }),
      prisma.costCenter.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: [{ createdAt: 'desc' }],
        include: { parent: true, project: true },
      }),
    ]);
  },

  findByIdAndDomain(id: string, domainId: string, adminId: string) {
    return prisma.costCenter.findFirst({
      where: { id, domainId, adminId, isDeleted: false },
      include: { parent: true, project: true },
    });
  },

  findByCode(code: string, domainId: string) {
    return prisma.costCenter.findFirst({
      where: { code, domainId, isDeleted: false },
    });
  },

  countSiblings(domainId: string, parentId: string | null) {
    return prisma.costCenter.count({
      where: { domainId, parentId: parentId ?? null },
    });
  },

  countAccounts(costCenterId: string) {
    return prisma.account.count({
      where: { costCenterId, isDeleted: false },
    });
  },

  update(id: string, data: Prisma.CostCenterUncheckedUpdateInput) {
    return prisma.costCenter.update({ where: { id }, data });
  },

  incrementChildrenCount(id: string, delta: number) {
    return prisma.costCenter.update({
      where: { id },
      data: { childrenCount: { increment: delta } },
    });
  },

  softDelete(id: string) {
    return prisma.costCenter.update({
      where: { id },
      data: { isDeleted: true, status: 'INACTIVE' },
    });
  },
};
