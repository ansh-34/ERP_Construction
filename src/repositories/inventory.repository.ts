import type { Prisma } from '@infra/database/prisma/generated/prisma/client/client';
import prisma from '../infra/database/prisma/prisma.client.js';

const inventoryIncludes = {
  product: {
    select: {
      id: true,
      displayName: true,
      code: true,
      productType: true,
      _count: {
        select: {
          productGrades: { where: { isDeleted: false } },
          productUoms: { where: { isDeleted: false } },
        },
      },
    },
  },
  productGrade: {
    select: {
      id: true,
      gradeDisplayName: true,
      gradeCode: true,
      status: true,
      productGradeStdRates: {
        where: { isDeleted: false },
        select: {
          id: true,
          stdRateType: true,
          stdRateValue: true,
          alertThresold: true,
          status: true,
        },
      },
    },
  },
  uom: {
    select: {
      id: true,
      displayName: true,
      code: true,
      conversionRate: true,
    },
  },
} satisfies Prisma.InventoryInclude;

export const InventoryRepository = {
  create(data: Prisma.InventoryUncheckedCreateInput) {
    return prisma.inventory.create({
      data,
      include: inventoryIncludes,
    });
  },

  findByIdAndDomain(id: string, domainId: string) {
    return prisma.inventory.findFirst({
      where: { id, domainId, isDeleted: false },
      include: inventoryIncludes,
    });
  },

  count(options: {
    filters: {
      domainId?: string;
      status?: 'ACTIVE' | 'INACTIVE';
      searchKey?: string;
      adminId?: string;
      lowStock?: boolean;
    };
  }) {
    const whereClause: any = {
      isDeleted: false,
      ...(options.filters && {
        ...(options.filters.domainId && { domainId: options.filters.domainId }),
        ...(options.filters.status && { status: options.filters.status }),
        ...(options.filters.searchKey && {
          searchText: { contains: options.filters.searchKey },
        }),
        ...(options.filters.adminId && { adminId: options.filters.adminId }),
        ...(Object.prototype.hasOwnProperty.call(
          options.filters,
          'lowStock',
        ) && {
          quantity: {
            ...(options.filters.lowStock
              ? { lte: prisma.inventory.fields.reorderLevel }
              : { gt: prisma.inventory.fields.reorderLevel }),
          },
        }),
      }),
    };

    return prisma.inventory.count({ where: whereClause });
  },

  listByDomain(
    domainId: string,
    limit: number,
    offset: number,
    status?: 'ACTIVE' | 'INACTIVE',
  ) {
    const where: Prisma.InventoryWhereInput = {
      domainId,
      isDeleted: false,
      ...(status ? { status } : {}),
    };

    return prisma.$transaction([
      prisma.inventory.count({ where }),
      prisma.inventory.findMany({
        where,
        include: inventoryIncludes,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
    ]);
  },

  update(id: string, data: Prisma.InventoryUncheckedUpdateInput) {
    return prisma.inventory.update({
      where: { id },
      data,
      include: inventoryIncludes,
    });
  },

  softDelete(id: string) {
    return prisma.inventory.update({
      where: { id },
      data: { isDeleted: true, status: 'INACTIVE' },
    });
  },

  /** Aggregate stats for a domain */
  async getStats(domainId: string) {
    const where: Prisma.InventoryWhereInput = { domainId, isDeleted: false };

    const [totalItems, aggregation, lowStockCount] = await prisma.$transaction([
      prisma.inventory.count({ where }),
      prisma.inventory.aggregate({
        where,
        _sum: { quantity: true },
      }),
      prisma.inventory.count({
        where: {
          ...where,
          quantity: { lte: prisma.inventory.fields.reorderLevel as any },
        },
      }),
    ]);

    return {
      totalItems,
      totalQuantity: aggregation._sum.quantity ?? 0,
      lowStockCount,
    };
  },

  /** Low-stock count using raw query for column-to-column comparison */
  async getLowStockCount(domainId: string) {
    const result = await prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*)::bigint AS count
      FROM "Inventory"
      WHERE "domainId" = ${domainId}::uuid
        AND "isDeleted" = false
        AND "quantity" <= "reorderLevel"
    `;
    return Number(result[0].count);
  },

  /** Fetch all records for export (no pagination) */
  exportAll(domainId: string) {
    return prisma.inventory.findMany({
      where: { domainId, isDeleted: false },
      include: inventoryIncludes,
      orderBy: { createdAt: 'desc' },
    });
  },

  async getStatsDetailed(domainId: string) {
    const where = { domainId, isDeleted: false };
    const [
      totalItems,
      activeCount,
      inactiveCount,
      outOfStockCount,
      aggregation,
    ] = await prisma.$transaction([
      prisma.inventory.count({ where }),
      prisma.inventory.count({ where: { ...where, status: 'ACTIVE' } }),
      prisma.inventory.count({ where: { ...where, status: 'INACTIVE' } }),
      prisma.inventory.count({ where: { ...where, quantity: 0 } }),
      prisma.inventory.aggregate({
        where,
        _sum: { quantity: true },
      }),
    ]);

    return {
      totalItems,
      activeCount,
      inactiveCount,
      outOfStockCount,
      totalQuantity: aggregation._sum.quantity ?? 0,
    };
  },

  async countUniqueProducts(domainId: string) {
    const result = await prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(DISTINCT "productId")::bigint AS count
      FROM "Inventory"
      WHERE "domainId" = ${domainId}::uuid AND "isDeleted" = false
    `;
    return Number(result[0].count);
  },
};
