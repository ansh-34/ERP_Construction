import { StatusEnum } from '@constants/index';
import { prisma } from '@infra/database/prisma/prisma.client';

export const DomainRepository = {
  findById: async (id: string) => {
    return prisma.domain.findFirst({
      where: {
        id,
        isDeleted: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        roleId: true,
        isDeleted: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  findByEmail: async (email: string) => {
    return prisma.domain.findFirst({
      where: {
        email,
        isDeleted: false,
      },
      select: {
        id: true,
        name: true,
        password: true,
        email: true,
        roleId: true,
        isDeleted: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  create: async (
    name: string,
    email: string,
    password: string,
    roleId: string,
  ) => {
    return prisma.domain.create({
      data: { name, email, password, roleId: roleId },
      select: {
        id: true,
        name: true,
        email: true,
        roleId: true,
        isDeleted: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
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
    return prisma.domain.update({
      where: { id },
      data: {
        ...data,
        ...(data.roleId && { roleId: data.roleId }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        roleId: true,
        isDeleted: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  softDelete: async (id: string) => {
    return prisma.domain.update({
      where: { id },
      data: { isDeleted: true },
      select: {
        id: true,
        name: true,
        email: true,
        roleId: true,
        isDeleted: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  count: async (whereFilter: any) => {
    return prisma.domain.count({
      where: whereFilter,
    });
  },

  list: async (whereFilter: any, limit: number, offset: number) => {
    return prisma.domain.findMany({
      where: whereFilter,
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
      select: {
        id: true,
        name: true,
        email: true,
        roleId: true,
        isDeleted: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },
};
