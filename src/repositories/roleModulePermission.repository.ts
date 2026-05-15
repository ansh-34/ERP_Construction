import prisma from '../infra/database/prisma/prisma.client.js';

export const RoleModulePermissionRepository = {
  upsert(data: {
    roleId: string;
    moduleId: string;
    permissions: string[];
    domainId: string;
  }) {
    return prisma.roleModulePermission.upsert({
      where: {
        roleId_moduleId_domainId: {
          roleId: data.roleId,
          moduleId: data.moduleId,
          domainId: data.domainId,
        },
      },
      update: { permissions: data.permissions },
      create: data,
    });
  },

  findByRoleIdAndDomainId(roleId: string, domainId: string) {
    return prisma.roleModulePermission.findMany({
      where: { roleId, domainId },
      include: {
        module: {
          select: {
            id: true,
            name: true,
            code: true,
            status: true,
          },
        },
      },
    });
  },
};
