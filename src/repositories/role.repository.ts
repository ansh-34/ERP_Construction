import { StatusEnum } from '@constants/index';
import { prisma } from '@infra/database/prisma/prisma.client';

export const RoleRepository = {
  findByCode: async (code: string) => {
    return prisma.role.findFirst({
      where: {
        code,
        is_deleted: false,
      },
    });
  },

  findById: async (id: string) => {
    return prisma.role.findFirst({
      where: {
        id,
        is_deleted: false,
      },
    });
  },

  findDuplicateCode: async (code: string, roleId: string) => {
    return prisma.role.findFirst({
      where: {
        code,
        is_deleted: false,
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
      data: { is_deleted: true },
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
        created_at: 'desc',
      },
      take: limit,
      skip: offset,
    });
  },
};
