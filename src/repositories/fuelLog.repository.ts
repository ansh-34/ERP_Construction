import prisma from '@/infra/database/prisma/prisma.client';
import { StatusEnum } from '@constants/index';
import type { MaintenanceAssetType } from './maintenanceSchedule.repository';

export type FuelType = 'PETROL' | 'DIESEL';
export type FuelDirectionType = 'CONSUMED' | 'FILLED';
export type FuelTransactionType = 'REFILL' | 'CONSUMED';
export type FuelEntityType = 'PROJECT_FUEL_TANK' | 'VEHICLE' | 'MACHINERY';

export interface UpdateFuelLogInput {
  fuelType?: FuelType;
  equipmentUniqueId?: string | null;
  equipmentCategory?: MaintenanceAssetType | null;
  equipmentType?: string | null;
  date?: Date;
  fuelDirectionType?: FuelDirectionType;
  fuelValue?: number;
  fuelQuantity?: number;
  transactionType?: FuelTransactionType;
  fuelEntityType?: FuelEntityType;
  fuelUomId?: string;
  projectId?: string;
  vehicleId?: string | null;
  machineryId?: string | null;
  searchText?: string;
}

export interface CreateFuelLogInput {
  fuelType: FuelType;
  equipmentUniqueId?: string | null;
  equipmentCategory?: MaintenanceAssetType | null;
  equipmentType?: string | null;
  date: Date;
  fuelDirectionType: FuelDirectionType;
  fuelValue: number;
  fuelQuantity: number;
  transactionType: FuelTransactionType;
  fuelEntityType: FuelEntityType;
  searchText: string;
  fuelUomId: string;
  projectId?: string | null;
  vehicleId?: string | null;
  machineryId?: string | null;
  domainId: string;
  adminId: string;
  status: StatusEnum;
}

const fuelLogInclude = {
  fuelUom: { select: { id: true, code: true, displayName: true } },
  project: { select: { id: true, code: true, name: true, status: true } },
  inventoryFuelStock: true,
  vehicle: { select: { id: true, numberPlate: true, vehicleType: true } },
  machinery: { select: { id: true, code: true, type: true } },
} as const;

export const fuelLogRepository = {
  create(data: CreateFuelLogInput) {
    return prisma.$transaction(async (tx) => {
      if (!data.projectId) {
        throw new Error('projectId is required');
      }

      const existingStock = await tx.inventoryFuelStock.findFirst({
        where: {
          projectId: data.projectId,
          fuelType: data.fuelType,
          uomId: data.fuelUomId,
          domainId: data.domainId,
          isDeleted: false,
        },
      });

      let stock = existingStock;

      if (data.transactionType === 'REFILL') {
        stock = existingStock
          ? await tx.inventoryFuelStock.update({
              where: { id: existingStock.id },
              data: {
                availableQuantity: { increment: data.fuelQuantity },
                totalRefilledQuantity: { increment: data.fuelQuantity },
              },
            })
          : await tx.inventoryFuelStock.create({
              data: {
                projectId: data.projectId,
                fuelType: data.fuelType,
                uomId: data.fuelUomId,
                availableQuantity: data.fuelQuantity,
                totalRefilledQuantity: data.fuelQuantity,
                totalConsumedQuantity: 0,
                domainId: data.domainId,
                adminId: data.adminId,
                status: StatusEnum.ACTIVE,
              },
            });
      } else {
        if (!existingStock) {
          throw new Error('fuel stock not found');
        }

        if (existingStock.availableQuantity < data.fuelQuantity) {
          throw new Error('insufficient fuel stock');
        }

        stock = await tx.inventoryFuelStock.update({
          where: { id: existingStock.id },
          data: {
            availableQuantity: { decrement: data.fuelQuantity },
            totalConsumedQuantity: { increment: data.fuelQuantity },
          },
        });
      }

      return tx.fuelLog.create({
        data: {
          fuelType: data.fuelType,
          equipmentUniqueId: data.equipmentUniqueId,
          equipmentCategory: data.equipmentCategory,
          equipmentType: data.equipmentType,
          date: data.date,
          fuelDirectionType: data.fuelDirectionType,
          fuelValue: data.fuelValue,
          fuelQuantity: data.fuelQuantity,
          transactionType: data.transactionType,
          fuelEntityType: data.fuelEntityType,
          searchText: data.searchText,
          fuelUomId: data.fuelUomId,
          projectId: data.projectId,
          vehicleId: data.vehicleId ?? null,
          machineryId: data.machineryId ?? null,
          inventoryFuelStockId: stock.id,
          domainId: data.domainId,
          adminId: data.adminId,
          status: data.status,
        },
        include: fuelLogInclude,
      });
    });
  },

  findMany(
    domainId: string,
    adminId?: string,
    filters: {
      fuelType?: FuelType;
      equipmentCategory?: MaintenanceAssetType;
      fuelDirectionType?: FuelDirectionType;
      transactionType?: FuelTransactionType;
      fuelEntityType?: FuelEntityType;
      equipmentUniqueId?: string;
      projectId?: string;
      fromDate?: Date;
      toDate?: Date;
      searchKey?: string;
    } = {},
    offset = 0,
    limit = 10,
  ) {
    const where = buildWhere(domainId, adminId, filters);
    return prisma.fuelLog.findMany({
      where,
      include: fuelLogInclude,
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      skip: offset,
      take: limit,
    });
  },

  count(
    domainId: string,
    adminId?: string,
    filters: {
      fuelType?: FuelType;
      equipmentCategory?: MaintenanceAssetType;
      fuelDirectionType?: FuelDirectionType;
      transactionType?: FuelTransactionType;
      fuelEntityType?: FuelEntityType;
      equipmentUniqueId?: string;
      projectId?: string;
      fromDate?: Date;
      toDate?: Date;
      searchKey?: string;
    } = {},
  ) {
    return prisma.fuelLog.count({
      where: buildWhere(domainId, adminId, filters),
    });
  },

  findById(id: string, domainId: string, adminId?: string) {
    return prisma.fuelLog.findFirst({
      where: {
        id,
        domainId,
        isDeleted: false,
        ...(adminId ? { adminId } : {}),
      },
      include: fuelLogInclude,
    });
  },

  update(
    id: string,
    domainId: string,
    data: UpdateFuelLogInput,
    adminId?: string,
  ) {
    return prisma.fuelLog.update({
      where: { id, domainId, ...(adminId ? { adminId } : {}) },
      data: {
        ...(data.fuelType !== undefined ? { fuelType: data.fuelType } : {}),
        ...(data.equipmentUniqueId !== undefined
          ? { equipmentUniqueId: data.equipmentUniqueId }
          : {}),
        ...(data.equipmentCategory !== undefined
          ? { equipmentCategory: data.equipmentCategory }
          : {}),
        ...(data.equipmentType !== undefined
          ? { equipmentType: data.equipmentType }
          : {}),
        ...(data.date !== undefined ? { date: data.date } : {}),
        ...(data.fuelDirectionType !== undefined
          ? { fuelDirectionType: data.fuelDirectionType }
          : {}),
        ...(data.transactionType !== undefined
          ? { transactionType: data.transactionType }
          : {}),
        ...(data.fuelEntityType !== undefined
          ? { fuelEntityType: data.fuelEntityType }
          : {}),
        ...(data.fuelValue !== undefined ? { fuelValue: data.fuelValue } : {}),
        ...(data.fuelQuantity !== undefined
          ? { fuelQuantity: data.fuelQuantity }
          : {}),
        ...(data.fuelUomId !== undefined ? { fuelUomId: data.fuelUomId } : {}),
        ...(data.projectId !== undefined ? { projectId: data.projectId } : {}),
        ...(data.vehicleId !== undefined ? { vehicleId: data.vehicleId } : {}),
        ...(data.machineryId !== undefined
          ? { machineryId: data.machineryId }
          : {}),
        ...(data.searchText !== undefined
          ? { searchText: data.searchText }
          : {}),
      },
      include: fuelLogInclude,
    });
  },

  softDelete(id: string, domainId: string, adminId?: string) {
    return prisma.fuelLog.updateMany({
      where: {
        id,
        domainId,
        isDeleted: false,
        ...(adminId ? { adminId } : {}),
      },
      data: { isDeleted: true },
    });
  },
};

function buildWhere(
  domainId: string,
  adminId?: string,
  filters: {
    fuelType?: FuelType;
    equipmentCategory?: MaintenanceAssetType;
    fuelDirectionType?: FuelDirectionType;
    transactionType?: FuelTransactionType;
    fuelEntityType?: FuelEntityType;
    equipmentUniqueId?: string;
    projectId?: string;
    fromDate?: Date;
    toDate?: Date;
    searchKey?: string;
  } = {},
) {
  return {
    domainId,
    isDeleted: false,
    ...(adminId ? { adminId } : {}),
    ...(filters.fuelType ? { fuelType: filters.fuelType } : {}),
    ...(filters.equipmentCategory
      ? { equipmentCategory: filters.equipmentCategory }
      : {}),
    ...(filters.fuelDirectionType
      ? { fuelDirectionType: filters.fuelDirectionType }
      : {}),
    ...(filters.transactionType
      ? { transactionType: filters.transactionType }
      : {}),
    ...(filters.fuelEntityType
      ? { fuelEntityType: filters.fuelEntityType }
      : {}),
    ...(filters.equipmentUniqueId
      ? { equipmentUniqueId: filters.equipmentUniqueId }
      : {}),
    ...(filters.projectId ? { projectId: filters.projectId } : {}),
    ...(filters.fromDate || filters.toDate
      ? {
          date: {
            ...(filters.fromDate ? { gte: filters.fromDate } : {}),
            ...(filters.toDate ? { lte: filters.toDate } : {}),
          },
        }
      : {}),
    ...(filters.searchKey
      ? { searchText: { contains: filters.searchKey.toLowerCase() } }
      : {}),
  };
}
