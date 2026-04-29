import prisma from '../infra/database/prisma/prisma.client.js';

export const InventoryRepository = {
  findByDomainId(domainId: string) {
    return prisma.inventory.findUnique({ where: { domainId } });
  },
};
