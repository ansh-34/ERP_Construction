import type { Prisma } from '@infra/database/prisma/generated/prisma/client/client';
import prisma from '../infra/database/prisma/prisma.client.js';

export const ProductRepository = {
  create(data: Prisma.ProductUncheckedCreateInput) {
    return prisma.product.create({ data });
  },

  listByDomain(domainId: string, limit: number, offset: number) {
    return prisma.$transaction([
      prisma.product.count({
        where: { domainId, isDeleted: false },
      }),
      prisma.product.findMany({
        where: { domainId, isDeleted: false },
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
    ]);
  },

  findByIdAndDomain(id: string, domainId: string) {
    return prisma.product.findFirst({
      where: { id, domainId, isDeleted: false },
    });
  },

  update(id: string, data: Prisma.ProductUncheckedUpdateInput) {
    return prisma.product.update({
      where: { id },
      data,
    });
  },

  softDelete(id: string) {
    return prisma.product.update({
      where: { id },
      data: { isDeleted: true, status: 'INACTIVE' },
    });
  },
};
