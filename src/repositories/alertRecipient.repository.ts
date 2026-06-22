import prisma from '@/infra/database/prisma/prisma.client';

export const alertRecipientRepository = {
  async findUsersWithModulePermission(
    domainId: string,
    moduleCode: string,
    permission = 'READ',
  ) {
    const module = await prisma.module.findFirst({
      where: { code: moduleCode, isDeleted: false },
      select: { id: true },
    });

    if (!module) return [];

    return prisma.user.findMany({
      where: {
        domainId,
        isDeleted: false,
        status: 'ACTIVE',
        roleId: { not: null },
        role: {
          roleModulePermissions: {
            some: {
              domainId,
              moduleId: module.id,
              permissions: { has: permission },
            },
          },
        },
      },
      select: { id: true },
    });
  },
};
