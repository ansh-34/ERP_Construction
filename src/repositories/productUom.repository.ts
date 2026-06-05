import { Prisma } from '@infra/database/prisma/generated/prisma/client/client';
import prisma from '../infra/database/prisma/prisma.client.js';

type ProductUomClient = Prisma.TransactionClient | typeof prisma;

export const productUomRepository = {
  create(
    data: Prisma.ProductUomUncheckedCreateInput,
    client: ProductUomClient = prisma,
  ) {
    return client.productUom.create({ data });
  },

  createWithUom(
    data: Prisma.ProductUomUncheckedCreateInput,
    client: ProductUomClient = prisma,
  ) {
    return client.productUom.create({
      data,
      include: { uom: true },
    });
  },

  findByProductAndUom(
    productId: string,
    uomId: string,
    client: ProductUomClient = prisma,
  ) {
    return client.productUom.findUnique({
      where: { productId_uomId: { productId, uomId } },
    });
  },

  findMany(
    where: Prisma.ProductUomWhereInput,
    client: ProductUomClient = prisma,
  ) {
    return client.productUom.findMany({ where });
  },

  listWithDetails(
    where: Prisma.ProductUomWhereInput,
    skip: number,
    take: number,
  ) {
    return Promise.all([
      prisma.productUom.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { uom: true, product: true },
      }),
      prisma.productUom.count({ where }),
    ]);
  },

  findByIdAndProductAndDomain(id: string, productId: string, domainId: string) {
    return prisma.productUom.findFirst({
      where: { id, productId, domainId, isDeleted: false },
      include: { uom: true },
    });
  },

  restoreWithUom(
    id: string,
    status: 'ACTIVE' | 'INACTIVE',
    client: ProductUomClient = prisma,
  ) {
    return client.productUom.update({
      where: { id },
      data: { isDeleted: false, status },
      include: { uom: true },
    });
  },

  softDelete(id: string) {
    return prisma.productUom.update({
      where: { id },
      data: { isDeleted: true },
    });
  },

  softDeleteByUomIds(domainId: string, productId: string, uomIds: string[]) {
    return prisma.productUom.updateMany({
      where: { uomId: { in: uomIds }, productId, domainId },
      data: { isDeleted: true },
    });
  },
};
