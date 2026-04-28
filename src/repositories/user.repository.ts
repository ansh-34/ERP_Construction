import { prisma } from '@infra/database/prisma/prisma.client';
import { StatusEnum } from '@constants/index';

export const UserRepository = {
  findByEmail: async (email: string, domainId: string) => {
    return prisma.user.findFirst({
      where: {
        email,
        domainId,
        isDeleted: false,
      },
    });
  },
  findByEmailOnly: async (email: string) => {
    return prisma.user.findFirst({
      where: {
        email,
        isDeleted: false,
      },
    });
  },

  findById: async (id: string) => {
    return prisma.user.findFirst({
      where: {
        id,
        isDeleted: false,
      },
      include: {
        role: true,
        domain: true,
      },
    });
  },

  assignToTerritory: async (userId: string, territoryId: string | null) => {
    return prisma.user.findFirst({ where: { id: userId } });
  },

  create: async (data: {
    name: string;
    email: string;
    password: string;
    roleId: string;
    domainId: string;
  }) => {
    return prisma.user.create({
      data,
    });
  },

  update: async (
    id: string,
    data: {
      name?: string;
      email?: string;
      password?: string;
      roleId?: string;
      status?: StatusEnum;
    },
  ) => {
    return prisma.user.update({
      where: { id },
      data,
    });
  },

  softDelete: async (id: string) => {
    return prisma.user.update({
      where: { id },
      data: { isDeleted: true },
    });
  },

  count: async (whereFilter: any) => {
    return prisma.user.count({
      where: whereFilter,
    });
  },

  list: async (whereFilter: any, limit: number, offset: number) => {
    return prisma.user.findMany({
      where: whereFilter,
      include: {
        role: true,
        domain: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });
  },

  findByIdWithRole: async (id: string) => {
    return prisma.user.findFirst({
      where: {
        id,
        isDeleted: false,
      },
      include: {
        role: true,
      },
    });
  },

  findByIdWithRoleUser: async (id: string) => {
    return prisma.role.findFirst({
      where: { id },
    });
  },
};
