import { StatusEnum } from '@constants/index';
import { prisma } from '@infra/database/prisma/prisma.client';

export const RoleRepository = {
  findByCode: async (code: string) => {
    return prisma.role.findFirst({
      where: {
        code,
        isDeleted: false,
      },
    });
  },

  findById: async (id: string) => {
    return prisma.role.findFirst({
      where: {
        id,
        isDeleted: false,
      },
    });
  },

  findDuplicateCode: async (code: string, roleId: string) => {
    return prisma.role.findFirst({
      where: {
        code,
        isDeleted: false,
        NOT: {
          id: roleId,
        },
      },
    });
  },

  create: async (name: string, code: string, level: number) => {
    return prisma.role.create({
      data: { name, code, level },
    });
  },

  update: async (
    id: string,
    data: { name?: string; code?: string; status?: StatusEnum; level?: number },
  ) => {
    return prisma.role.update({
      where: { id },
      data,
    });
  },

  softDelete: async (id: string) => {
    return prisma.role.update({
      where: { id },
      data: { isDeleted: true },
    });
  },

  count: async (whereFilter: any) => {
    return prisma.role.count({
      where: whereFilter,
    });
  },

  list: async (whereFilter: any, limit: number, offset: number) => {
    return prisma.role.findMany({
      where: whereFilter,
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });
  },
};
