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

  listByDomain(
    domainId: string,
    limit: number,
    offset: number,
    status?: string,
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
      data: { isDeleted: true, status: 'inactive' },
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
};
