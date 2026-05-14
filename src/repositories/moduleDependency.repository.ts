import prisma from '../infra/database/prisma/prisma.client.js';

export const ModuleDependencyRepository = {
  findByPair(moduleId: string, dependentModuleId: string) {
    return prisma.moduleDependency.findFirst({
      where: {
        moduleId,
        dependentModuleId,
        isDeleted: false,
      },
    });
  },

  create(
    data: {
      moduleId: string;
      dependentModuleId: string;
    },
    options: { transaction?: any } = {},
  ) {
    const prismaClient = options?.transaction || prisma;

    return prismaClient.moduleDependency.create({
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
          module: {
            select: { id: true, name: true, code: true },
            where: { isDeleted: false },
          },
          dependentModule: {
            select: { id: true, name: true, code: true },
            where: { isDeleted: false },
          },
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

  softDelete(id: string) {
    return prisma.moduleDependency.update({
      where: { id },
      data: { isDeleted: true },
    });
  },

  bulkCreate(
    data: {
      moduleId: string;
      dependentModuleId: string;
    }[],
    options: { transaction?: any } = {},
  ) {
    const prismaClient = options?.transaction || prisma;

    return Promise.all(
      data.map((item) =>
        prismaClient.moduleDependency.create({
          data: item,
        }),
      ),
    );
  },
};
