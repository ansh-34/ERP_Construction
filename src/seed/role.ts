import { roles } from '@constants/index';
import prisma from '@/infra/database/prisma/prisma.client';

export const seedDefaultRolesForDomain = async (
  domainId: string,
  adminId: string,
) => {
  try {
    const rolesData = [];

    for (const role of roles) {
      const userType = await prisma.adminUserType.findFirst({
        where: {
          adminId,
          code: role.code,
          status: 'ACTIVE',
          isDeleted: false,
        },
      });
      const existingRole = await prisma.role.findFirst({
        where: {
          isDeleted: false,
          code: role.code,
          domainId,
          adminId,
        },
      });
      if (!existingRole) {
        rolesData.push({
          name: role.name,
          code: role.code,
          level: role.level,
          searchText: Object.values(role.name).join(' ').toLowerCase(),
          domainId,
          adminId,
          userTypeId: userType?.id ?? null,
          userTypeCode: userType?.code ?? role.code,
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
