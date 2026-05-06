import { permissions } from '@constants/index';
import prisma from '@/infra/database/prisma/prisma.client';

export const permissionData = async () => {
  try {
    const permissionsData = [];

    for (const permission of permissions) {
      const existingPermission = await prisma.permission.findFirst({
        where: {
          isDeleted: false,
          code: permission.code,
        },
        select: {
          id: true,
        },
      });
      if (!existingPermission) {
        permissionsData.push({
          name: permission.name,
          code: permission.code,
        });
      }
    }

    if (permissionsData.length > 0) {
      await prisma.permission.createMany({
        data: permissionsData,
      });
    }
  } catch (error) {
    console.log('error', error);
  }
};
