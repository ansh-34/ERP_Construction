import { Prisma } from '@infra/database/prisma/generated/prisma/client/client';
import prisma from '../infra/database/prisma/prisma.client.js';

export const IndustryAccountCategoryRepository = {
  findDuplicate(
    industryType: Prisma.EnumIndustryEnumFilter['equals'],
    code: string,
    excludeId?: string,
  ) {
    return prisma.industryAccountCategory.findFirst({
      where: {
        industryType,
        code,
        isDeleted: false,
        ...(excludeId && { NOT: { id: excludeId } }),
      },
    });
  },

  findById(id: string) {
    return prisma.industryAccountCategory.findFirst({
      where: { id, isDeleted: false },
    });
  },

  findManyByIds(ids: string[]) {
    return prisma.industryAccountCategory.findMany({
      where: { id: { in: ids }, isDeleted: false },
      orderBy: [{ level: 'asc' }, { sortOrder: 'asc' }],
    });
  },

  countAccounts(id: string) {
    return prisma.industryAccount.count({
      where: {
        industryAccountCategoryId: id,
        isDeleted: false,
      },
    });
  },

  list(
    limit: number,
    offset: number,
    filter?: {
      industryType?: Prisma.EnumIndustryEnumFilter['equals'];
      categoryType?: Prisma.EnumAccountCategoryTypeFilter['equals'];
      parentId?: string | null;
      status?: 'ACTIVE' | 'INACTIVE';
      searchKey?: string;
    },
  ) {
    const where: Prisma.IndustryAccountCategoryWhereInput = {
      isDeleted: false,
      ...(filter?.industryType && { industryType: filter.industryType }),
      ...(filter?.categoryType && { categoryType: filter.categoryType }),
      ...(filter?.parentId !== undefined && { parentId: filter.parentId }),
      ...(filter?.status && { status: filter.status }),
      ...(filter?.searchKey && {
        searchText: { contains: filter.searchKey, mode: 'insensitive' },
      }),
    };

    return prisma.$transaction([
      prisma.industryAccountCategory.count({ where }),
      prisma.industryAccountCategory.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        skip: offset,
        take: limit,
      }),
    ]);
  },

  async create(
    data: Prisma.IndustryAccountCategoryUncheckedCreateInput,
    parentId?: string | null,
  ) {
    return prisma.$transaction(async (tx) => {
      const created = await tx.industryAccountCategory.create({ data });
      if (parentId) {
        await tx.industryAccountCategory.update({
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
    data: Prisma.IndustryAccountCategoryUncheckedUpdateInput,
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
          await tx.industryAccountCategory.update({
            where: { id: move.oldParentId },
            data: { childrenCount: { decrement: 1 } },
          });
        }
        if (move.newParentId) {
          await tx.industryAccountCategory.update({
            where: { id: move.newParentId },
            data: {
              childrenCount: { increment: 1 },
              isPostingAllowed: false,
            },
          });
        }

        const descendants = await tx.industryAccountCategory.findMany({
          where: {
            path: { startsWith: `${move.oldPath}/` },
            isDeleted: false,
          },
          select: { id: true, path: true, level: true },
        });

        for (const descendant of descendants) {
          await tx.industryAccountCategory.update({
            where: { id: descendant.id },
            data: {
              path: `${move.newPath}${descendant.path.slice(move.oldPath.length)}`,
              level: descendant.level + move.levelDelta,
            },
          });
        }
      }

      return tx.industryAccountCategory.update({ where: { id }, data });
    });
  },

  async softDelete(id: string, parentId: string | null) {
    return prisma.$transaction(async (tx) => {
      const deleted = await tx.industryAccountCategory.update({
        where: { id },
        data: { isDeleted: true, status: 'INACTIVE' },
      });
      if (parentId) {
        await tx.industryAccountCategory.update({
          where: { id: parentId },
          data: { childrenCount: { decrement: 1 } },
        });
      }
      return deleted;
    });
  },
};
