import prisma from '@/infra/database/prisma/prisma.client';
import { StatusEnum } from '@constants/index';
import type { FuelType } from './fuelLog.repository';

export interface InventoryFuelStockFilters {
  fuelType?: FuelType;
  uomId?: string;
  status?: StatusEnum;
  searchKey?: string;
}

const inventoryFuelStockInclude = {
  uom: { select: { id: true, code: true, displayName: true } },
} as const;

export const inventoryFuelStockRepository = {
  findMany(
    domainId: string,
    filters: InventoryFuelStockFilters = {},
    offset = 0,
    limit = 10,
  ) {
    return prisma.inventoryFuelStock.findMany({
      where: buildWhere(domainId, filters),
      include: inventoryFuelStockInclude,
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
      skip: offset,
      take: limit,
    });
  },

  count(domainId: string, filters: InventoryFuelStockFilters = {}) {
    return prisma.inventoryFuelStock.count({
      where: buildWhere(domainId, filters),
    });
  },

  findById(id: string, domainId: string) {
    return prisma.inventoryFuelStock.findFirst({
      where: {
        id,
        domainId,
        isDeleted: false,
      },
      include: inventoryFuelStockInclude,
    });
  },
};

function buildWhere(domainId: string, filters: InventoryFuelStockFilters) {
  return {
    domainId,
    isDeleted: false,
    ...(filters.fuelType ? { fuelType: filters.fuelType } : {}),
    ...(filters.uomId ? { uomId: filters.uomId } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.searchKey
      ? {
          OR: [
            { fuelType: { equals: filters.searchKey as FuelType } },
            { uom: { code: { contains: filters.searchKey } } },
          ],
        }
      : {}),
  };
}
