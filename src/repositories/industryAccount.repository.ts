import { Prisma } from '@infra/database/prisma/generated/prisma/client/client';
import prisma from '../infra/database/prisma/prisma.client.js';

export const IndustryAccountRepository = {
  findDuplicate(
    industryType: Prisma.EnumIndustryEnumFilter['equals'],
    code: string,
    excludeId?: string,
  ) {
    return prisma.industryAccount.findFirst({
      where: {
        industryType,
        code,
        isDeleted: false,
        ...(excludeId && { NOT: { id: excludeId } }),
      },
    });
  },

  findById(id: string) {
    return prisma.industryAccount.findFirst({
      where: { id, isDeleted: false },
    });
  },

  currencyExists(id: string) {
    return prisma.currency.findFirst({
      where: { id, status: 'ACTIVE', isDeleted: false },
      select: { id: true },
    });
  },

  list(
    limit: number,
    offset: number,
    filter?: {
      industryType?: Prisma.EnumIndustryEnumFilter['equals'];
      categoryId?: string;
      parentId?: string | null;
      isPostingAllowed?: boolean;
      isCashOrBank?: boolean;
      status?: 'ACTIVE' | 'INACTIVE';
      searchKey?: string;
    },
  ) {
    const where: Prisma.IndustryAccountWhereInput = {
      isDeleted: false,
      ...(filter?.industryType && { industryType: filter.industryType }),
      ...(filter?.categoryId && {
        industryAccountCategoryId: filter.categoryId,
      }),
      ...(filter?.parentId !== undefined && { parentId: filter.parentId }),
      ...(filter?.isPostingAllowed !== undefined && {
        isPostingAllowed: filter.isPostingAllowed,
      }),
      ...(filter?.isCashOrBank !== undefined && {
        isCashOrBank: filter.isCashOrBank,
      }),
      ...(filter?.status && { status: filter.status }),
      ...(filter?.searchKey && {
        OR: [
          {
            searchText: { contains: filter.searchKey, mode: 'insensitive' },
          },
          { code: { contains: filter.searchKey, mode: 'insensitive' } },
          {
            description: {
              contains: filter.searchKey,
              mode: 'insensitive',
            },
          },
        ],
      }),
    };

    return prisma.$transaction([
      prisma.industryAccount.count({ where }),
      prisma.industryAccount.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        skip: offset,
        take: limit,
      }),
    ]);
  },

  async create(
    data: Prisma.IndustryAccountUncheckedCreateInput,
    parentId?: string | null,
  ) {
    return prisma.$transaction(async (tx) => {
      const created = await tx.industryAccount.create({ data });
      if (parentId) {
        await tx.industryAccount.update({
          where: { id: parentId },
          data: {
            childrenCount: { increment: 1 },
            isPostingAllowed: false,
          },
        });
      }
      return created;
    });
  },

  async update(
    id: string,
    data: Prisma.IndustryAccountUncheckedUpdateInput,
    move?: {
      oldParentId: string | null;
      newParentId: string | null;
      oldPath: string;
      newPath: string;
      levelDelta: number;
    },
  ) {
    return prisma.$transaction(async (tx) => {
      if (move) {
        if (move.oldParentId) {
          await tx.industryAccount.update({
            where: { id: move.oldParentId },
            data: { childrenCount: { decrement: 1 } },
          });
        }
        if (move.newParentId) {
          await tx.industryAccount.update({
            where: { id: move.newParentId },
            data: {
              childrenCount: { increment: 1 },
              isPostingAllowed: false,
            },
          });
        }

        const descendants = await tx.industryAccount.findMany({
          where: {
            path: { startsWith: `${move.oldPath}/` },
            isDeleted: false,
          },
          select: { id: true, path: true, level: true },
        });

        for (const descendant of descendants) {
          await tx.industryAccount.update({
            where: { id: descendant.id },
            data: {
              path: `${move.newPath}${descendant.path.slice(move.oldPath.length)}`,
              level: descendant.level + move.levelDelta,
            },
          });
        }
      }

      return tx.industryAccount.update({ where: { id }, data });
    });
  },

  async softDelete(id: string, parentId: string | null) {
    return prisma.$transaction(async (tx) => {
      const deleted = await tx.industryAccount.update({
        where: { id },
        data: { isDeleted: true, status: 'INACTIVE' },
      });
      if (parentId) {
        await tx.industryAccount.update({
          where: { id: parentId },
          data: { childrenCount: { decrement: 1 } },
        });
      }
      return deleted;
    });
  },
};
