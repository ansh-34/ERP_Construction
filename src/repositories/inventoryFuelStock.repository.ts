import prisma from '@/infra/database/prisma/prisma.client';
import { StatusEnum } from '@constants/index';
import type { FuelType } from './fuelLog.repository';

export interface InventoryFuelStockFilters {
  projectId?: string;
  fuelType?: FuelType;
  uomId?: string;
  status?: StatusEnum;
  searchKey?: string;
}

const inventoryFuelStockInclude = {
  project: { select: { id: true, code: true, name: true, status: true } },
  uom: { select: { id: true, code: true, displayName: true } },
} as const;

export const inventoryFuelStockRepository = {
  findMany(
    domainId: string,
    adminId: string,
    filters: InventoryFuelStockFilters = {},
    offset = 0,
    limit = 10,
  ) {
    return prisma.inventoryFuelStock.findMany({
      where: buildWhere(domainId, adminId, filters),
      include: inventoryFuelStockInclude,
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
      skip: offset,
      take: limit,
    });
  },

  count(
    domainId: string,
    adminId: string,
    filters: InventoryFuelStockFilters = {},
  ) {
    return prisma.inventoryFuelStock.count({
      where: buildWhere(domainId, adminId, filters),
    });
  },

  findById(id: string, domainId: string, adminId: string) {
    return prisma.inventoryFuelStock.findFirst({
      where: {
        id,
        domainId,
        adminId,
        isDeleted: false,
      },
      include: inventoryFuelStockInclude,
    });
  },
};

function buildWhere(
  domainId: string,
  adminId: string,
  filters: InventoryFuelStockFilters,
) {
  return {
    domainId,
    adminId,
    isDeleted: false,
    ...(filters.projectId ? { projectId: filters.projectId } : {}),
    ...(filters.fuelType ? { fuelType: filters.fuelType } : {}),
    ...(filters.uomId ? { uomId: filters.uomId } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.searchKey
      ? {
          OR: [
            { fuelType: { equals: filters.searchKey as FuelType } },
            { project: { code: { contains: filters.searchKey } } },
            { uom: { code: { contains: filters.searchKey } } },
          ],
        }
      : {}),
  };
}
