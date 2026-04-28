import { prisma } from '@infra/database/prisma/prisma.client';
import { StatusEnum } from '@constants/index';

export const PermissionRepository = {
  findByCode: async (code: string) => {
    return prisma.permission.findFirst({
      where: {
        code,
        isDeleted: false,
      },
    });
  },

  findById: async (id: string) => {
    return prisma.permission.findFirst({
      where: {
        id,
        isDeleted: false,
      },
    });
  },

  findDuplicateCode: async (code: string, permissionId: string) => {
    return prisma.permission.findFirst({
      where: {
        code,
        isDeleted: false,
        NOT: {
          id: permissionId,
        },
      },
    });
  },

  create: async (name: string, code: string) => {
    return prisma.permission.create({
      data: { name, code },
    });
  },

  update: async (
    id: string,
    data: { name?: string; code?: string; status?: StatusEnum },
  ) => {
    return prisma.permission.update({
      where: { id },
      data,
    });
  },

  softDelete: async (id: string) => {
    return prisma.permission.update({
      where: { id },
      data: { isDeleted: true },
    });
  },

  count: async (whereFilter: Record<string, unknown>) => {
    return prisma.permission.count({
      where: whereFilter,
    });
  },

  list: async (
    whereFilter: Record<string, unknown>,
    limit: number,
    offset: number,
  ) => {
    return prisma.permission.findMany({
      where: whereFilter,
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });
  },
};
