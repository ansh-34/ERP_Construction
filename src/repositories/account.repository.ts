import { Prisma } from '@infra/database/prisma/generated/prisma/client/client';
import prisma from '../infra/database/prisma/prisma.client.js';

export const accountRepository = {
  create(data: Prisma.AccountUncheckedCreateInput) {
    return prisma.account.create({ data });
  },

  listByDomain(
    domainId: string,
    adminId: string,
    limit: number,
    offset: number,
    filter?: {
      status?: 'ACTIVE' | 'INACTIVE';
      searchKey?: string;
      accountCategoryId?: string;
      parentId?: string | null;
      isCashOrBank?: boolean;
    },
  ) {
    const searchKey = filter?.searchKey?.trim() || '';
    const where: Prisma.AccountWhereInput = {
      domainId,
      adminId,
      isDeleted: false,
      ...(filter?.status && { status: filter.status }),
      ...(filter?.accountCategoryId && {
        accountCategoryId: filter.accountCategoryId,
      }),
      ...(filter?.parentId !== undefined && { parentId: filter.parentId }),
      ...(filter?.isCashOrBank !== undefined && {
        isCashOrBank: filter.isCashOrBank,
      }),
      ...(searchKey && {
        searchText: { contains: searchKey, mode: 'insensitive' as const },
      }),
    };

    return prisma.$transaction([
      prisma.account.count({ where }),
      prisma.account.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        include: { parent: true, accountCategory: true, currency: true },
      }),
    ]);
  },

  findByIdAndDomain(id: string, domainId: string, adminId: string) {
    return prisma.account.findFirst({
      where: { id, domainId, adminId, isDeleted: false },
      include: { parent: true, accountCategory: true, currency: true },
    });
  },

  findByCode(code: string, domainId: string) {
    return prisma.account.findFirst({
      where: { code, domainId, isDeleted: false },
    });
  },

  countSiblings(domainId: string, parentId: string | null) {
    return prisma.account.count({
      where: { domainId, parentId: parentId ?? null },
    });
  },

  update(id: string, data: Prisma.AccountUncheckedUpdateInput) {
    return prisma.account.update({ where: { id }, data });
  },

  incrementChildrenCount(id: string, delta: number) {
    return prisma.account.update({
      where: { id },
      data: {
        childrenCount: { increment: delta },
        ...(delta > 0 && { isPostingAllowed: false }),
      },
    });
  },

  async countLedgerReferences(accountId: string) {
    const [ledgerCount, balanceCount] = await prisma.$transaction([
      prisma.generalLedgerEntry.count({ where: { accountId } }),
      prisma.accountBalance.count({ where: { accountId } }),
    ]);
    return ledgerCount + balanceCount;
  },

  softDelete(id: string) {
    return prisma.account.update({
      where: { id },
      data: { isDeleted: true, status: 'INACTIVE', isActive: false },
    });
  },
};
