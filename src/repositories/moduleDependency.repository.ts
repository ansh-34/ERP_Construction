import prisma from '../infra/database/prisma/prisma.client.js';

export const ModuleDependencyRepository = {
  findByPair(moduleId: string, dependentModuleId: string) {
    return prisma.moduleDependency.findUnique({
      where: { moduleId_dependentModuleId: { moduleId, dependentModuleId } },
    });
  },

  create(data: {
    moduleId: string;
    dependentModuleId: string;
    permissions: string[];
  }) {
    return prisma.moduleDependency.create({
      data,
      include: {
        module: { select: { id: true, name: true, code: true } },
        dependentModule: { select: { id: true, name: true, code: true } },
      },
    });
  },

  list(limit: number, offset: number) {
    return prisma.$transaction([
      prisma.moduleDependency.count(),
      prisma.moduleDependency.findMany({
        include: {
          module: { select: { id: true, name: true, code: true } },
          dependentModule: { select: { id: true, name: true, code: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
    ]);
  },

  findById(id: string) {
    return prisma.moduleDependency.findUnique({ where: { id } });
  },

  delete(id: string) {
    return prisma.moduleDependency.delete({ where: { id } });
  },
};
