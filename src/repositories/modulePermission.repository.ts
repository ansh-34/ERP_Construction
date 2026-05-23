import prisma from '../infra/database/prisma/prisma.client.js';

export const ModulePermissionRepository = {
  findByModuleId(moduleId: string) {
    return prisma.modulePermission.findFirst({ where: { moduleId } });
  },

  list(
    limit: number,
    offset: number,
    options: { filter?: any; transaction?: any } = {},
  ) {
    const whereClause: any = {
      isDeleted: false,
      module: {
        isDeleted: false,
      },
      permission: {
        isDeleted: false,
        ...(options.filter?.searchKey && {
          searchText: {
            contains: options.filter.searchKey,
            mode: 'insensitive',
          },
        }),

        ...(options.filter?.status && {
          status: options.filter.status,
        }),
      },
      ...(options.filter?.moduleId && {
        moduleId: options.filter.moduleId,
      }),
      ...(options.filter?.permissionId && {
        permissionId: options.filter.permissionId,
      }),
    };

    return prisma.$transaction([
      prisma.modulePermission.count({
        where: whereClause,
      }),

      prisma.modulePermission.findMany({
        include: {
          module: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          permission: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
        where: whereClause,
        orderBy: {
          createdAt: 'desc',
        },
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

  bulkCreate(
    data: {
      moduleId: string;
      permissionId: string;
    }[],
    options: { skipDuplicates?: boolean; transaction?: any } = {},
  ) {
    return options?.transaction
      ? options.transaction.modulePermission.createMany({
          data,
          skipDuplicates: Object.prototype.hasOwnProperty.call(
            options,
            'skipDuplicates',
          )
            ? options.skipDuplicates
            : true,
        })
      : prisma.modulePermission.createMany({
          data,
          skipDuplicates: true,
        });
  },

  async validateModulesPermissions(
    data: { moduleId: string; permissionId: string }[],
  ) {
    if (!data.length) return true;

    const results = await Promise.all(
      data.map(({ moduleId, permissionId }) =>
        prisma.modulePermission.count({
          where: {
            moduleId,
            permissionId,
          },
        }),
      ),
    );

    return results.every((count) => count > 0);
  },
};
