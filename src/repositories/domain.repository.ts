import { StatusEnum } from '@constants/index';
import { prisma } from '@infra/database/prisma/prisma.client';

export const DomainRepository = {
  findById: async (id: string) => {
    return prisma.domain.findFirst({
      where: {
        id,
        is_deleted: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role_id: true,
        is_deleted: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
    });
  },

  findByEmail: async (email: string) => {
    return prisma.domain.findFirst({
      where: {
        email,
        is_deleted: false,
      },
      select: {
        id: true,
        name: true,
        password: true,
        email: true,
        role_id: true,
        is_deleted: true,
        status: true,
        created_at: true,
        updated_at: true,
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
      data: { name, email, password, role_id: roleId },
      select: {
        id: true,
        name: true,
        email: true,
        role_id: true,
        is_deleted: true,
        status: true,
        created_at: true,
        updated_at: true,
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
        ...(data.roleId && { role_id: data.roleId }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role_id: true,
        is_deleted: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
    });
  },

  softDelete: async (id: string) => {
    return prisma.domain.update({
      where: { id },
      data: { is_deleted: true },
      select: {
        id: true,
        name: true,
        email: true,
        role_id: true,
        is_deleted: true,
        status: true,
        created_at: true,
        updated_at: true,
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
        created_at: 'desc',
      },
      take: limit,
      skip: offset,
      select: {
        id: true,
        name: true,
        email: true,
        role_id: true,
        is_deleted: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
    });
  },
};
