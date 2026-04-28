import prisma from '@/infra/database/prisma/prisma.client';
import { StatusEnum } from '@constants/index';

export const RoleModulePermissionRepository = {
  async createMany(
    data: {
      roleId: string;
      moduleId: string;
      permissionId: string;
      domainId?: string | null;
    }[],
  ) {
    return prisma.roleModulePermission.createMany({
      data,
    });
  },

  async deleteByRole(roleId: string) {
    return prisma.roleModulePermission.deleteMany({
      where: {
        roleId,
        isDeleted: false,
      },
    });
  },

  async findByRole(roleId: string) {
    return prisma.roleModulePermission.findMany({
      where: {
        roleId,
        isDeleted: false,
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
        createdAt: 'desc',
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
