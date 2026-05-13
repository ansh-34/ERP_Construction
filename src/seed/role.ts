import { roles } from '@constants/index';
import prisma from '@/infra/database/prisma/prisma.client';

export const roleData = async (domainId: string) => {
  try {
    const rolesData = [];

    for (const role of roles) {
      const existingRole = await prisma.role.findFirst({
        where: {
          isDeleted: false,
          code: role.code,
          domainId,
        },
      });
      if (!existingRole) {
        rolesData.push({
          name: role.name,
          code: role.code,
          level: role.level,
          domainId,
        });
      }
    }

    if (rolesData.length > 0) {
      await prisma.role.createMany({
        data: rolesData as any,
      });
    }
  } catch (error) {
    console.log('error', error);
  }
};
