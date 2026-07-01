import { Prisma } from '@infra/database/prisma/generated/prisma/client/client';
import prisma from '../infra/database/prisma/prisma.client.js';

export const accountCategoryRepository = {
  create(data: Prisma.AccountCategoryUncheckedCreateInput) {
    return prisma.accountCategory.create({ data });
  },

  listByDomain(
    domainId: string,
    adminId: string,
    limit: number,
    offset: number,
    filter?: {
      status?: 'ACTIVE' | 'INACTIVE';
      searchKey?: string;
      categoryType?: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
      parentId?: string | null;
    },
  ) {
    const searchKey = filter?.searchKey?.trim() || '';
    const where: Prisma.AccountCategoryWhereInput = {
      domainId,
      adminId,
      isDeleted: false,
      ...(filter?.status && { status: filter.status }),
      ...(filter?.categoryType && { categoryType: filter.categoryType }),
      ...(filter?.parentId !== undefined && { parentId: filter.parentId }),
      ...(searchKey && {
        searchText: { contains: searchKey, mode: 'insensitive' as const },
      }),
    };

    return prisma.$transaction([
      prisma.accountCategory.count({ where }),
      prisma.accountCategory.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        include: { parent: true },
      }),
    ]);
  },

  findByIdAndDomain(id: string, domainId: string, adminId: string) {
    return prisma.accountCategory.findFirst({
      where: { id, domainId, adminId, isDeleted: false },
      include: { parent: true },
    });
  },

  findByCode(code: string, domainId: string) {
    return prisma.accountCategory.findFirst({
      where: { code, domainId, isDeleted: false },
    });
  },

  countSiblings(domainId: string, parentId: string | null) {
    return prisma.accountCategory.count({
      where: { domainId, parentId: parentId ?? null },
    });
  },

  update(id: string, data: Prisma.AccountCategoryUncheckedUpdateInput) {
    return prisma.accountCategory.update({ where: { id }, data });
  },

  incrementChildrenCount(id: string, delta: number) {
    return prisma.accountCategory.update({
      where: { id },
      data: {
        childrenCount: { increment: delta },
        ...(delta > 0 && { isPostingAllowed: false }),
      },
    });
  },

  countAccounts(accountCategoryId: string) {
    return prisma.account.count({
      where: { accountCategoryId, isDeleted: false },
    });
  },

  softDelete(id: string) {
    return prisma.accountCategory.update({
      where: { id },
      data: { isDeleted: true, status: 'INACTIVE' },
    });
  },
};
