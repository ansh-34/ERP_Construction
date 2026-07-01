import prisma from '@/infra/database/prisma/prisma.client';
import { StatusEnum } from '@constants/index';

export type MachineryInventoryTransactionType = 'INWARD' | 'OUTWARD';

export interface MachineryInventoryFilters {
  machineId?: string;
  uomId?: string;
  status?: StatusEnum;
  searchKey?: string;
  lowStockOnly?: boolean;
}

export interface MachineryInventoryLogFilters {
  machineryInventoryId?: string;
  machineId?: string;
  uomId?: string;
  transactionType?: MachineryInventoryTransactionType;
  status?: StatusEnum;
  searchKey?: string;
  fromDate?: Date;
  toDate?: Date;
}

export interface CreateMachineryInventoryLogInput {
  date: Date;
  transactionType: MachineryInventoryTransactionType;
  name: string;
  searchText: string;
  notes?: string | null;
  quantity: number;
  restockLevel?: number;
  machineryInventoryId?: string;
  machineId: string;
  uomId: string;
  domainId: string;
  adminId: string;
  status: StatusEnum;
}

export interface UpdateMachineryInventoryLogInput {
  date?: Date;
  transactionType?: MachineryInventoryTransactionType;
  name?: string;
  searchText?: string;
  notes?: string | null;
  quantity?: number;
  restockLevel?: number;
  machineryInventoryId?: string;
  machineId?: string;
  uomId?: string;
  status?: StatusEnum;
}

const inventoryInclude = {
  machine: {
    select: {
      id: true,
      code: true,
      type: true,
      projectId: true,
      status: true,
    },
  },
  uom: { select: { symbol: true, id: true, code: true, displayName: true } },
} as const;

const logInclude = {
  machineryInventory: {
    select: {
      id: true,
      name: true,
      quantity: true,
      restockLevel: true,
      machineId: true,
      uomId: true,
    },
  },
  machine: {
    select: {
      id: true,
      code: true,
      type: true,
      projectId: true,
      status: true,
    },
  },
  uom: { select: { symbol: true, id: true, code: true, displayName: true } },
} as const;

function buildInventoryWhere(
  domainId: string,
  adminId: string,
  filters: MachineryInventoryFilters,
) {
  return {
    domainId,
    adminId,
    isDeleted: false,
    ...(filters.machineId ? { machineId: filters.machineId } : {}),
    ...(filters.uomId ? { uomId: filters.uomId } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.searchKey
      ? {
          OR: [
            {
              name: {
                contains: filters.searchKey,
                mode: 'insensitive' as const,
              },
            },
            {
              searchText: {
                contains: filters.searchKey.toLowerCase(),
                mode: 'insensitive' as const,
              },
            },
            {
              machine: {
                code: {
                  contains: filters.searchKey,
                  mode: 'insensitive' as const,
                },
              },
            },
          ],
        }
      : {}),
  };
}

function buildLogWhere(
  domainId: string,
  adminId: string,
  filters: MachineryInventoryLogFilters,
) {
  return {
    domainId,
    adminId,
    isDeleted: false,
    ...(filters.machineryInventoryId
      ? { machineryInventoryId: filters.machineryInventoryId }
      : {}),
    ...(filters.machineId ? { machineId: filters.machineId } : {}),
    ...(filters.uomId ? { uomId: filters.uomId } : {}),
    ...(filters.transactionType
      ? { transactionType: filters.transactionType }
      : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.fromDate || filters.toDate
      ? {
          date: {
            ...(filters.fromDate ? { gte: filters.fromDate } : {}),
            ...(filters.toDate ? { lte: filters.toDate } : {}),
          },
        }
      : {}),
    ...(filters.searchKey
      ? {
          OR: [
            {
              name: {
                contains: filters.searchKey,
                mode: 'insensitive' as const,
              },
            },
            {
              notes: {
                contains: filters.searchKey,
                mode: 'insensitive' as const,
              },
            },
            {
              searchText: {
                contains: filters.searchKey.toLowerCase(),
                mode: 'insensitive' as const,
              },
            },
            {
              machine: {
                code: {
                  contains: filters.searchKey,
                  mode: 'insensitive' as const,
                },
              },
            },
          ],
        }
      : {}),
  };
}

function applyDelta(
  currentQuantity: number,
  transactionType: MachineryInventoryTransactionType,
  quantity: number,
) {
  return transactionType === 'INWARD'
    ? currentQuantity + quantity
    : currentQuantity - quantity;
}

async function resolveInventory(
  tx: any,
  data: CreateMachineryInventoryLogInput,
) {
  if (data.machineryInventoryId) {
    const inventory = await tx.machineryInventory.findFirst({
      where: {
        id: data.machineryInventoryId,
        domainId: data.domainId,
        adminId: data.adminId,
        isDeleted: false,
      },
    });

    if (!inventory) throw new Error('Machinery inventory not found');
    return inventory;
  }

  const existing = await tx.machineryInventory.findFirst({
    where: {
      name: data.name,
      machineId: data.machineId,
      domainId: data.domainId,
      adminId: data.adminId,
      isDeleted: false,
    },
  });

  if (existing) return existing;

  if (data.transactionType === 'OUTWARD') {
    throw new Error('Machinery inventory not found');
  }

  return tx.machineryInventory.create({
    data: {
      name: data.name,
      searchText: data.searchText,
      machineId: data.machineId,
      quantity: 0,
      restockLevel: data.restockLevel ?? 0,
      uomId: data.uomId,
      domainId: data.domainId,
      adminId: data.adminId,
      status: StatusEnum.ACTIVE,
    },
  });
}

export const machineryInventoryRepository = {
  findMany(
    domainId: string,
    adminId: string,
    filters: MachineryInventoryFilters = {},
    offset = 0,
    limit = 10,
  ) {
    return prisma.machineryInventory.findMany({
      where: buildInventoryWhere(domainId, adminId, filters),
      include: inventoryInclude,
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
      skip: offset,
      take: limit,
    });
  },

  count(
    domainId: string,
    adminId: string,
    filters: MachineryInventoryFilters = {},
  ) {
    return prisma.machineryInventory.count({
      where: buildInventoryWhere(domainId, adminId, filters),
    });
  },

  findById(id: string, domainId: string, adminId: string) {
    return prisma.machineryInventory.findFirst({
      where: { id, domainId, adminId, isDeleted: false },
      include: inventoryInclude,
    });
  },
};

export const machineryInventoryLogRepository = {
  findMany(
    domainId: string,
    adminId: string,
    filters: MachineryInventoryLogFilters = {},
    offset = 0,
    limit = 10,
  ) {
    return prisma.machineryInventoryLog.findMany({
      where: buildLogWhere(domainId, adminId, filters),
      include: logInclude,
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      skip: offset,
      take: limit,
    });
  },

  count(
    domainId: string,
    adminId: string,
    filters: MachineryInventoryLogFilters = {},
  ) {
    return prisma.machineryInventoryLog.count({
      where: buildLogWhere(domainId, adminId, filters),
    });
  },

  findById(id: string, domainId: string, adminId: string) {
    return prisma.machineryInventoryLog.findFirst({
      where: { id, domainId, adminId, isDeleted: false },
      include: logInclude,
    });
  },

  create(data: CreateMachineryInventoryLogInput) {
    return prisma.$transaction(async (tx) => {
      const inventory = await resolveInventory(tx, data);
      const nextQuantity = applyDelta(
        inventory.quantity,
        data.transactionType,
        data.quantity,
      );

      if (nextQuantity < 0) {
        throw new Error('Insufficient machinery inventory quantity');
      }

      const updatedInventory = await tx.machineryInventory.update({
        where: { id: inventory.id },
        data: {
          quantity: nextQuantity,
          ...(data.restockLevel !== undefined
            ? { restockLevel: data.restockLevel }
            : {}),
          ...(data.uomId !== inventory.uomId ? { uomId: data.uomId } : {}),
          searchText: data.searchText,
        },
      });

      return tx.machineryInventoryLog.create({
        data: {
          date: data.date,
          transactionType: data.transactionType,
          name: updatedInventory.name,
          searchText: data.searchText,
          notes: data.notes ?? null,
          quantity: data.quantity,
          machineryInventoryId: updatedInventory.id,
          machineId: updatedInventory.machineId,
          uomId: updatedInventory.uomId,
          domainId: data.domainId,
          adminId: data.adminId,
          status: data.status,
        },
        include: logInclude,
      });
    });
  },

  update(
    id: string,
    domainId: string,
    adminId: string,
    data: UpdateMachineryInventoryLogInput,
  ) {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.machineryInventoryLog.findFirst({
        where: { id, domainId, adminId, isDeleted: false },
      });

      if (!existing) return null;

      const oldInventory = await tx.machineryInventory.findFirst({
        where: {
          id: existing.machineryInventoryId,
          domainId,
          adminId,
          isDeleted: false,
        },
      });

      if (!oldInventory) throw new Error('Machinery inventory not found');

      const reversedOldQuantity =
        existing.transactionType === 'INWARD'
          ? oldInventory.quantity - existing.quantity
          : oldInventory.quantity + existing.quantity;

      if (reversedOldQuantity < 0) {
        throw new Error('Insufficient machinery inventory quantity');
      }

      await tx.machineryInventory.update({
        where: { id: oldInventory.id },
        data: { quantity: reversedOldQuantity },
      });

      const nextCreateInput: CreateMachineryInventoryLogInput = {
        date: data.date ?? existing.date,
        transactionType: data.transactionType ?? existing.transactionType,
        name: data.name ?? existing.name,
        searchText: data.searchText ?? existing.searchText,
        notes: data.notes ?? existing.notes,
        quantity: data.quantity ?? existing.quantity,
        restockLevel: data.restockLevel,
        machineryInventoryId:
          data.machineryInventoryId ?? existing.machineryInventoryId,
        machineId: data.machineId ?? existing.machineId,
        uomId: data.uomId ?? existing.uomId,
        domainId,
        adminId,
        status: (data.status ?? existing.status) as StatusEnum,
      };

      const targetInventory = await resolveInventory(tx, nextCreateInput);
      const nextTargetQuantity = applyDelta(
        targetInventory.id === oldInventory.id
          ? reversedOldQuantity
          : targetInventory.quantity,
        nextCreateInput.transactionType,
        nextCreateInput.quantity,
      );

      if (nextTargetQuantity < 0) {
        throw new Error('Insufficient machinery inventory quantity');
      }

      const updatedInventory = await tx.machineryInventory.update({
        where: { id: targetInventory.id },
        data: {
          quantity: nextTargetQuantity,
          ...(data.restockLevel !== undefined
            ? { restockLevel: data.restockLevel }
            : {}),
          ...(nextCreateInput.uomId !== targetInventory.uomId
            ? { uomId: nextCreateInput.uomId }
            : {}),
          searchText: nextCreateInput.searchText,
        },
      });

      return tx.machineryInventoryLog.update({
        where: { id },
        data: {
          date: nextCreateInput.date,
          transactionType: nextCreateInput.transactionType,
          name: updatedInventory.name,
          searchText: nextCreateInput.searchText,
          notes: nextCreateInput.notes ?? null,
          quantity: nextCreateInput.quantity,
          machineryInventoryId: updatedInventory.id,
          machineId: updatedInventory.machineId,
          uomId: updatedInventory.uomId,
          status: nextCreateInput.status,
        },
        include: logInclude,
      });
    });
  },

  softDelete(id: string, domainId: string, adminId: string) {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.machineryInventoryLog.findFirst({
        where: { id, domainId, adminId, isDeleted: false },
      });

      if (!existing) return null;

      const inventory = await tx.machineryInventory.findFirst({
        where: {
          id: existing.machineryInventoryId,
          domainId,
          adminId,
          isDeleted: false,
        },
      });

      if (!inventory) throw new Error('Machinery inventory not found');

      const nextQuantity =
        existing.transactionType === 'INWARD'
          ? inventory.quantity - existing.quantity
          : inventory.quantity + existing.quantity;

      if (nextQuantity < 0) {
        throw new Error('Insufficient machinery inventory quantity');
      }

      await tx.machineryInventory.update({
        where: { id: inventory.id },
        data: { quantity: nextQuantity },
      });

      return tx.machineryInventoryLog.update({
        where: { id },
        data: { isDeleted: true, status: StatusEnum.INACTIVE },
        include: logInclude,
      });
    });
  },
};
