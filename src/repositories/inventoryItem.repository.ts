import prisma from '../infra/database/prisma/prisma.client.js';

export const InventoryItemRepository = {
  listByInventoryId(inventoryId: string, limit: number, offset: number) {
    return prisma.$transaction([
      prisma.inventoryItem.count({ where: { inventoryId } }),
      prisma.inventoryItem.findMany({
        where: { inventoryId },
        skip: offset,
        take: limit,
      }),
    ]);
  },

  create(data: {
    inventoryId: string;
    name: string;
    quantity: number;
    reorderLevel?: number;
    code?: string;
  }) {
    return prisma.inventoryItem.create({ data });
  },
};
