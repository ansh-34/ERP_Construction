import { StatusEnum } from '@constants/index';
import { prisma } from '@infra/database/prisma/prisma.client';

export const ModuleRepository = {
  findByCode: async (code: string) => {
    return prisma.module.findFirst({
      where: {
        code,
        isDeleted: false,
      },
    });
  },

  findById: async (id: string) => {
    return prisma.module.findFirst({
      where: {
        id,
        isDeleted: false,
      },
    });
  },

  findDuplicateCode: async (code: string, moduleId: string) => {
    return prisma.module.findFirst({
      where: {
        code,
        isDeleted: false,
        NOT: {
          id: moduleId,
        },
      },
    });
  },

  create: async (name: string, code: string) => {
    return prisma.module.create({
      data: { name, code },
    });
  },

  update: async (
    id: string,
    data: { name?: string; code?: string; status?: StatusEnum },
  ) => {
    return prisma.module.update({
      where: { id },
      data,
    });
  },

  softDelete: async (id: string) => {
    return prisma.module.update({
      where: { id },
      data: { isDeleted: true },
    });
  },

  count: async (whereFilter: any) => {
    return prisma.module.count({
      where: whereFilter,
    });
  },

  list: async (whereFilter: any, limit: number, offset: number) => {
    return prisma.module.findMany({
      where: whereFilter,
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });
  },
};
