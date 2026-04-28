import prisma from '@/infra/database/prisma/prisma.client';
import { StatusEnum } from '@constants/index';

export const RoleModulePermissionRepository = {
  async createMany(
    data: {
      role_id: string;
      module_id: string;
      permission_id: string;
      domain_id?: string | null;
    }[],
  ) {
    return prisma.roleModulePermission.createMany({
      data,
    });
  },

  async deleteByRole(role_id: string) {
    return prisma.roleModulePermission.deleteMany({
      where: {
        role_id,
        is_deleted: false,
      },
    });
  },

  async findByRole(role_id: string) {
    return prisma.roleModulePermission.findMany({
      where: {
        role_id,
        is_deleted: false,
      },
      include: {
        module: true,
        permission: true,
      },
    });
  },

  async list(where: any, limit: number, offset: number) {
    return prisma.roleModulePermission.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: {
        created_at: 'desc',
      },
      include: {
        module: true,
        permission: true,
      },
    });
  },

  async count(where: any) {
    return prisma.roleModulePermission.count({
      where,
    });
  },

  async updateStatus(id: string, status: StatusEnum) {
    return prisma.roleModulePermission.update({
      where: { id },
      data: { status },
    });
  },
};
