import { StatusEnum } from '@constants/index';
import { prisma } from '@infra/database/prisma/prisma.client';

export const SuperAdminRepository = {
  findById: async (id: string) => {
    return prisma.superAdmin.findFirst({
      where: {
        id,
        is_deleted: false,
      },
    });
  },

  findByEmail: async (email: string) => {
    return prisma.superAdmin.findFirst({
      where: {
        email,
        is_deleted: false,
      },
    });
  },

  create: async (
    name: string,
    email: string,
    password: string,
    roleId: string,
  ) => {
    return prisma.superAdmin.create({
      data: { name, email, password, role_id: roleId },
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
    return prisma.superAdmin.update({
      where: { id },
      data: {
        ...data,
        ...(data.roleId && { role_id: data.roleId }),
      },
    });
  },

  softDelete: async (id: string) => {
    return prisma.superAdmin.update({
      where: { id },
      data: { is_deleted: true },
    });
  },

  count: async (whereFilter: any) => {
    return prisma.superAdmin.count({
      where: whereFilter,
    });
  },

  list: async (whereFilter: any, limit: number, offset: number) => {
    return prisma.superAdmin.findMany({
      where: whereFilter,
      orderBy: {
        created_at: 'desc',
      },
      take: limit,
      skip: offset,
    });
  },
};
