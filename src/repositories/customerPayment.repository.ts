import { Prisma } from '@infra/database/prisma/generated/prisma/client/client';
import prisma from '../infra/database/prisma/prisma.client.js';

const includeRelations = {
  customer: {
    select: {
      id: true,
      name: true,
      phoneCode: true,
      phone: true,
      paymentTerms: true,
      status: true,
    },
  },
} satisfies Prisma.CustomerPaymentInclude;

export const customerPaymentRepository = {
  create(data: Prisma.CustomerPaymentUncheckedCreateInput) {
    return prisma.customerPayment.create({
      data,
      include: includeRelations,
    });
  },

  findByIdAndDomain(id: string, domainId: string, adminId: string) {
    return prisma.customerPayment.findFirst({
      where: { id, domainId, adminId, isDeleted: false },
      include: includeRelations,
    });
  },

  findLatestByCustomer(
    customerId: string,
    domainId: string,
    adminId: string,
    excludeId?: string,
  ) {
    return prisma.customerPayment.findFirst({
      where: {
        customerId,
        domainId,
        adminId,
        status: 'ACTIVE',
        isDeleted: false,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      orderBy: [{ paidDate: 'desc' }, { createdAt: 'desc' }],
    });
  },

  listByDomain(
    domainId: string,
    adminId: string,
    limit: number,
    offset: number,
    filter?: {
      customerId?: string;
      paymentType?: 'CASH';
      status?: 'ACTIVE' | 'INACTIVE';
      searchKey?: string;
      fromDate?: Date;
      toDate?: Date;
    },
  ) {
    const searchKey = filter?.searchKey?.trim() || '';
    const where: Prisma.CustomerPaymentWhereInput = {
      domainId,
      adminId,
      isDeleted: false,
      ...(filter?.customerId && { customerId: filter.customerId }),
      ...(filter?.paymentType && { paymentType: filter.paymentType }),
      ...(filter?.status && { status: filter.status }),
      ...(filter?.fromDate || filter?.toDate
        ? {
            paidDate: {
              ...(filter.fromDate && { gte: filter.fromDate }),
              ...(filter.toDate && { lte: filter.toDate }),
            },
          }
        : {}),
      ...(searchKey
        ? {
            OR: [
              { remarks: { contains: searchKey, mode: 'insensitive' } },
              { searchText: { contains: searchKey, mode: 'insensitive' } },
              {
                customer: {
                  name: { contains: searchKey, mode: 'insensitive' },
                },
              },
            ],
          }
        : {}),
    };

    return prisma.$transaction([
      prisma.customerPayment.count({ where }),
      prisma.customerPayment.findMany({
        where,
        include: includeRelations,
        orderBy: [{ paidDate: 'desc' }, { createdAt: 'desc' }],
        skip: offset,
        take: limit,
      }),
    ]);
  },

  update(id: string, data: Prisma.CustomerPaymentUncheckedUpdateInput) {
    return prisma.customerPayment.update({
      where: { id },
      data,
      include: includeRelations,
    });
  },

  softDelete(id: string) {
    return prisma.customerPayment.update({
      where: { id },
      data: { isDeleted: true, status: 'INACTIVE' },
      include: includeRelations,
    });
  },
};
