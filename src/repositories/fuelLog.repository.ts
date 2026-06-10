import prisma from '@/infra/database/prisma/prisma.client';
import { StatusEnum } from '@constants/index';
import type { MaintenanceAssetType } from './maintenanceSchedule.repository';

export type FuelType = 'PETROL' | 'DIESEL';
export type FuelDirectionType = 'CONSUMED' | 'FILLED';

export interface UpdateFuelLogInput {
  fuelType?: FuelType;
  equipmentUniqueId?: string;
  equipmentCategory?: MaintenanceAssetType;
  equipmentType?: string;
  date?: Date;
  fuelDirectionType?: FuelDirectionType;
  fuelValue?: number;
  fuelQuantity?: number;
  fuelUomId?: string;
  projectId?: string;
  searchText?: string;
}

export interface CreateFuelLogInput {
  fuelType: FuelType;
  equipmentUniqueId: string;
  equipmentCategory: MaintenanceAssetType;
  equipmentType: string;
  date: Date;
  fuelDirectionType: FuelDirectionType;
  fuelValue: number;
  fuelQuantity: number;
  searchText: string;
  fuelUomId: string;
  projectId?: string | null;
  domainId: string;
  adminId: string;
  status: StatusEnum;
}

const fuelLogInclude = {
  fuelUom: { select: { id: true, code: true, displayName: true } },
  project: { select: { id: true, code: true, name: true, status: true } },
} as const;

export const fuelLogRepository = {
  create(data: CreateFuelLogInput) {
    return prisma.fuelLog.create({
      data: {
        fuelType: data.fuelType,
        equipmentUniqueId: data.equipmentUniqueId,
        equipmentCategory: data.equipmentCategory,
        equipmentType: data.equipmentType,
        date: data.date,
        fuelDirectionType: data.fuelDirectionType,
        fuelValue: data.fuelValue,
        fuelQuantity: data.fuelQuantity,
        searchText: data.searchText,
        fuelUomId: data.fuelUomId,
        projectId: data.projectId ?? null,
        domainId: data.domainId,
        adminId: data.adminId,
        status: data.status,
      },
      include: fuelLogInclude,
    });
  },

  findMany(
    domainId: string,
    adminId?: string,
    filters: {
      fuelType?: FuelType;
      equipmentCategory?: MaintenanceAssetType;
      fuelDirectionType?: FuelDirectionType;
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
        ...(data.fuelValue !== undefined ? { fuelValue: data.fuelValue } : {}),
        ...(data.fuelQuantity !== undefined
          ? { fuelQuantity: data.fuelQuantity }
          : {}),
        ...(data.fuelUomId !== undefined ? { fuelUomId: data.fuelUomId } : {}),
        ...(data.projectId !== undefined ? { projectId: data.projectId } : {}),
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
