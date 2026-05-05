import prisma from '../infra/database/prisma/prisma.client.js';

export const ModuleDependencyPermissionRepository = {
  create(data: { permissionId: string; moduleDependencyId: string }) {
    return prisma.moduleDependencyPermission.create({
      data,
    });
  },

  list(limit: number, offset: number) {
    return prisma.$transaction([
      prisma.moduleDependencyPermission.count(),
      prisma.moduleDependencyPermission.findMany({
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
    ]);
  },

  findById(id: string) {
    return prisma.moduleDependencyPermission.findUnique({ where: { id } });
  },

  delete(id: string) {
    return prisma.moduleDependencyPermission.delete({ where: { id } });
  },

  bulkCreate(
    data: {
      permissionId: string;
      moduleDependencyId: string;
    }[],
    options: { skipDuplicates?: boolean; transaction?: any } = {},
  ) {
    return options?.transaction
      ? options.transaction.moduleDependencyPermission.createMany({
          data,
          skipDuplicates: Object.prototype.hasOwnProperty.call(
            options,
            'skipDuplicates',
          )
            ? options.skipDuplicates
            : true,
        })
      : prisma.moduleDependencyPermission.createMany({
          data,
          skipDuplicates: true,
        });
  },
};
