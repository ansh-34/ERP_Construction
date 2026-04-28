import { StatusEnum } from '@/constants';
import prisma from '@/infra/database/prisma/prisma.client';
import { roles } from '@constants/role';

export const giveFullAdminAccess = async () => {
  try {
    const adminRole = await prisma.role.findUnique({
      where: {
        code: roles[0].code,
        isDeleted: false,
        status: StatusEnum.ACTIVE,
      },
    });

    if (adminRole) {
      const modules = await prisma.module.findMany({
        where: {
          isDeleted: false,
        },
      });

      const permissions = await prisma.permission.findMany({
        where: {
          isDeleted: false,
        },
      });

      const rolePermissionsData: any[] = [];

      for (const module of modules) {
        for (const permission of permissions) {
          const existing = await prisma.roleModulePermission.findFirst({
            where: {
              roleId: adminRole.id,
              moduleId: module.id,
              permissionId: permission.id,
              isDeleted: false,
            },
          });

          if (!existing) {
            rolePermissionsData.push({
              roleId: adminRole.id,
              moduleId: module.id,
              permissionId: permission.id,
            });
          }
        }
      }

      if (rolePermissionsData.length > 0) {
        await prisma.roleModulePermission.createMany({
          data: rolePermissionsData,
        });
      }
    }
  } catch (error) {
    console.log('error', error);
  }
};
