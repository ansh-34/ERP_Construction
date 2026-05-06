import prisma from '../infra/database/prisma/prisma.client.js';

export const ModulePermissionRepository = {
  findByModuleId(moduleId: string) {
    return prisma.modulePermission.findFirst({ where: { moduleId } });
  },

  set(moduleId: string, permissions: string[]) {
    return prisma.modulePermission.upsert({
      where: { moduleId },
      update: { permissions },
      create: { moduleId, permissions },
      include: { module: { select: { id: true, name: true, code: true } } },
    });
  },

  list(limit: number, offset: number) {
    return prisma.$transaction([
      prisma.modulePermission.count(),
      prisma.modulePermission.findMany({
        include: {
          module: { select: { id: true, name: true, code: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
    ]);
  },

  findById(id: string) {
    return prisma.modulePermission.findUnique({ where: { id } });
  },

  delete(id: string) {
    return prisma.modulePermission.delete({ where: { id } });
  },
};
