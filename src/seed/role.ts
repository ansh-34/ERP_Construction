import { roles } from '@constants/index';
import prisma from '@/infra/database/prisma/prisma.client';

export const roleData = async () => {
  try {
    const rolesData = [];

    for (const role of roles) {
      const existingRole = await prisma.role.findFirst({
        where: {
          is_deleted: false,
          code: role.code,
        },
      });
      if (!existingRole) {
        rolesData.push({
          name: role.name,
          code: role.code,
          level: role.level,
          is_system: true,
        });
      }
    }

    if (rolesData.length > 0) {
      await prisma.role.createMany({
        data: rolesData,
      });
    }
  } catch (error) {
    console.log('error', error);
  }
};
