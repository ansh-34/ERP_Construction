import prisma from '../infra/database/prisma/prisma.client.js';

export const AdminCurrencyRepository = {
  findById(id: string, options: { select?: any; transaction?: any } = {}) {
    const prismaClient = options?.transaction || prisma;
    return prismaClient.adminCurrencies.findFirst({
      where: { id, isDeleted: false },
      select: options.select || {
        id: true,
        currencyId: true,
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
      currencyId?: string;
      isDefault?: boolean;
      isEnabled?: boolean;
      status?: 'active' | 'inactive';
      id?: string;
    },
    options: { select?: any; transaction?: any } = {},
  ) {
    const prismaClient = options?.transaction || prisma;
    return prismaClient.adminCurrencies.findFirst({
      where: { ...filters, isDeleted: false },
      select: options.select || {
        id: true,
        currencyId: true,
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
        currency: {
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
      prisma.adminCurrencies.count({ where: whereClause }),
      prisma.adminCurrencies.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        select: options?.select || {
          id: true,
          currency: {
            select: {
              id: true,
              name: true,
              code: true,
              symbol: true,
              flag: true,
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

  update(id: string, data: { isEnabled?: boolean; isDefault?: boolean }) {
    return prisma.adminCurrencies.update({
      where: { id },
      data,
    });
  },

  softDelete(id: string) {
    return prisma.adminCurrencies.update({
      where: { id },
      data: { isDeleted: true },
    });
  },

  bulkCreate(
    data: {
      adminId: string;
      currencyId: string;
      isEnabled?: boolean;
      isDefault?: boolean;
    }[],
    options: { skipDuplicates?: boolean; transaction?: any } = {},
  ) {
    return options?.transaction
      ? options.transaction.adminCurrencies.createMany({
          data,
          skipDuplicates: Object.prototype.hasOwnProperty.call(
            options,
            'skipDuplicates',
          )
            ? options.skipDuplicates
            : true,
        })
      : prisma.adminCurrencies.createMany({
          data,
          skipDuplicates: true,
        });
  },

  validateAdminCurrencies(data: { adminId: string; currencyIds: string[] }) {
    return prisma.adminCurrencies
      .findMany({
        where: {
          adminId: data.adminId,
          currencyId: { in: data.currencyIds },
          isDeleted: false,
        },
      })
      .then((currencies) => currencies.length === data.currencyIds.length);
  },

  enableCurrencies(adminId: string, currencyIds: string[]) {
    return prisma.adminCurrencies.updateMany({
      where: {
        adminId,
        currencyId: { in: currencyIds },
        isDeleted: false,
      },
      data: {
        isEnabled: true,
      },
    });
  },
};
