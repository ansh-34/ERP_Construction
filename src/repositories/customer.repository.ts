import { Prisma } from '@infra/database/prisma/generated/prisma/client/client';
import prisma from '../infra/database/prisma/prisma.client.js';

export const customerRepository = {
  create(data: Prisma.CustomerUncheckedCreateInput) {
    return prisma.customer.create({ data });
  },

  listByDomain(
    domainId: string,
    adminId: string,
    limit: number,
    offset: number,
    filter?: { status?: 'ACTIVE' | 'INACTIVE'; searchKey?: string },
  ) {
    const searchKey = filter?.searchKey?.trim() || '';
    const where: Prisma.CustomerWhereInput = {
      domainId,
      adminId,
      isDeleted: false,
      ...(filter?.status && { status: filter.status }),
      ...(searchKey && {
        searchText: { contains: searchKey, mode: 'insensitive' as const },
      }),
    };

    return prisma.$transaction([
      prisma.customer.count({ where }),
      prisma.customer.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: { location: true },
      }),
    ]);
  },

  findByIdAndDomain(id: string, domainId: string, adminId: string) {
    return prisma.customer.findFirst({
      where: { id, domainId, adminId, isDeleted: false },
      include: { location: true },
    });
  },

  update(id: string, data: Prisma.CustomerUncheckedUpdateInput) {
    return prisma.customer.update({ where: { id }, data });
  },

  softDelete(id: string) {
    return prisma.customer.update({
      where: { id },
      data: { isDeleted: true, status: 'INACTIVE' },
    });
  },
};
