import { prisma } from '@infra/database/prisma/prisma.client';
import { StatusEnum } from '@constants/index';

export const UserRepository = {
  findByEmail: async (email: string, domain_id: string) => {
    return prisma.user.findFirst({
      where: {
        email,
        domain_id,
        is_deleted: false,
      },
    });
  },
  findByEmailOnly: async (email: string) => {
    return prisma.user.findFirst({
      where: {
        email,
        is_deleted: false,
      },
    });
  },

  findById: async (id: string) => {
    return prisma.user.findFirst({
      where: {
        id,
        is_deleted: false,
      },
      include: {
        role: true,
        domain: true,
        loyalty_territory: true,
      },
    });
  },

  assignToTerritory: async (user_id: string, territory_id: string | null) => {
    return prisma.user.update({
      where: { id: user_id },
      data: { loyalty_territory_id: territory_id },
    });
  },

  create: async (data: {
    name: string;
    email: string;
    password: string;
    role_id: string;
    domain_id: string;
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
      role_id?: string;
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
      data: { is_deleted: true },
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
        created_at: 'desc',
      },
      take: limit,
      skip: offset,
    });
  },

  findByIdWithRole: async (id: string) => {
    return prisma.user.findFirst({
      where: {
        id,
        is_deleted: false,
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
