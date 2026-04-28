import { StatusEnum } from '@/constants';
import prisma from '@/infra/database/prisma/prisma.client';
import { roles } from '@constants/role';

export const giveFullAdminAccess = async () => {
  try {
    const adminRole = await prisma.role.findUnique({
      where: {
        code: roles[0].code,
        is_deleted: false,
        status: StatusEnum.ACTIVE,
      },
    });

    if (adminRole) {
      const modules = await prisma.module.findMany({
        where: {
          is_deleted: false,
        },
      });

      const permissions = await prisma.permission.findMany({
        where: {
          is_deleted: false,
        },
      });

      const rolePermissionsData: any[] = [];

      for (const module of modules) {
        for (const permission of permissions) {
          const existing = await prisma.roleModulePermission.findFirst({
            where: {
              role_id: adminRole.id,
              module_id: module.id,
              permission_id: permission.id,
              is_deleted: false,
            },
          });

          if (!existing) {
            rolePermissionsData.push({
              role_id: adminRole.id,
              module_id: module.id,
              permission_id: permission.id,
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
