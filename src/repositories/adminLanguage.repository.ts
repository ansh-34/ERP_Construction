import prisma from '../infra/database/prisma/prisma.client.js';

export const AdminLanguageRepository = {
  findById(id: string, options: { select?: any; transaction?: any } = {}) {
    const prismaClient = options?.transaction || prisma;
    return prismaClient.adminLanguages.findFirst({
      where: { id, isDeleted: false },
      select: options.select || {
        id: true,
        languageId: true,
        adminId: true,
        isDefault: true,
        isEnabled: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  findFirst(
    filters: {
      adminId?: string;
      languageId?: string;
      isDefault?: boolean;
      isEnabled?: boolean;
      status?: 'active' | 'inactive';
      id?: string;
    },
    options: { select?: any; transaction?: any } = {},
  ) {
    const prismaClient = options?.transaction || prisma;
    return prismaClient.adminLanguages.findFirst({
      where: { ...filters, isDeleted: false },
      select: options.select || {
        id: true,
        languageId: true,
        adminId: true,
        isDefault: true,
        isEnabled: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  listActive(
    limit: number,
    offset: number,
    options: { select?: any; transaction?: any; filters?: any } = {},
  ) {
    const prismaClient = options?.transaction || prisma;

    const whereClause = {
      isDeleted: false,
      ...(options.filters && {
        ...(options.filters.status && {
          status: options.filters.status,
        }),
        ...(Object.prototype.hasOwnProperty.call(
          options.filters,
          'isEnabled',
        ) && {
          isEnabled: options.filters.isEnabled,
        }),
        ...(Object.prototype.hasOwnProperty.call(
          options.filters,
          'isDefault',
        ) && {
          isDefault: options.filters.isDefault,
        }),
        language: {
          ...(options.filters.searchKey && {
            OR: [
              {
                name: {
                  contains: options.filters.searchKey,
                  mode: 'insensitive',
                },
              },
              {
                code: {
                  contains: options.filters.searchKey,
                  mode: 'insensitive',
                },
              },
            ],
          }),
          isDeleted: false,
        },
        ...(options.filters.adminId && { adminId: options.filters.adminId }),
      }),
    };

    return prismaClient.$transaction([
      prisma.adminLanguages.count({ where: whereClause }),
      prisma.adminLanguages.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        select: options?.select || {
          id: true,
          language: {
            select: {
              id: true,
              name: true,
              code: true,
              flag: true,
              dir: true,
            },
          },
          isDefault: true,
          isEnabled: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
        skip: offset,
        take: limit,
      }),
    ]);
  },

  find(options: {
    filters?: {
      adminId?: string;
      languageId?: string;
      isDefault?: boolean;
      isEnabled?: boolean;
      status?: 'active' | 'inactive';
      id?: string;
    };
    select?: any;
    transaction?: any;
  }) {
    const prismaClient = options?.transaction || prisma;
    return prismaClient.adminLanguages.findMany({
      where: { ...options.filters, isDeleted: false },
      select: options.select || {
        id: true,
        languageId: true,
        adminId: true,
        isDefault: true,
        isEnabled: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  update(id: string, data: { isEnabled?: boolean; isDefault?: boolean }) {
    return prisma.adminLanguages.update({
      where: { id },
      data,
    });
  },

  enableLanguages(adminId: string, languageIds: string[]) {
    return prisma.adminLanguages.updateMany({
      where: { adminId, languageId: { in: languageIds } },
      data: { isEnabled: true },
    });
  },

  softDelete(options: {
    filters: {
      ids?: string[];
      languageIds?: string[];
      adminId?: string;
    };
    transaction?: any;
  }) {
    const prismaClient = options?.transaction || prisma;

    if (!options.filters || Object.keys(options.filters).length === 0) {
      throw new Error('No filter provided to soft delete');
    }

    const whereClause: any = {
      ...(options.filters.ids && { id: { in: options.filters.ids } }),
      ...(options.filters.languageIds && {
        languageId: { in: options.filters.languageIds },
      }),
      ...(options.filters.adminId && { adminId: options.filters.adminId }),
    };

    return prismaClient.adminLanguages.updateMany({
      where: whereClause,
      data: { isDeleted: true },
    });
  },

  bulkCreate(
    data: {
      adminId: string;
      languageId: string;
      isEnabled?: boolean;
      isDefault?: boolean;
    }[],
    options: {
      skipDuplicates?: boolean;
      transaction?: any;
    } = {},
  ) {
    return options?.transaction
      ? options.transaction.adminLanguages.createMany({
          data,
          skipDuplicates: Object.prototype.hasOwnProperty.call(
            options,
            'skipDuplicates',
          )
            ? options.skipDuplicates
            : true,
        })
      : prisma.adminLanguages.createMany({
          data,
          skipDuplicates: true,
        });
  },

  async validateAdminLanguages(data: {
    languageIds: string[];
    adminId: string;
  }) {
    return prisma.adminLanguages
      .findMany({
        where: {
          languageId: { in: data.languageIds },
          adminId: data.adminId,
          isDeleted: false,
        },
      })
      .then((languages) => languages.length === data.languageIds.length);
  },
};
