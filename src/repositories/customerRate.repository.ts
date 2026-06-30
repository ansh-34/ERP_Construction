import { Prisma } from '@infra/database/prisma/generated/prisma/client/client';
import prisma from '../infra/database/prisma/prisma.client.js';

export const customerRateRepository = {
  create(data: Prisma.CustomerRateUncheckedCreateInput) {
    return prisma.customerRate.create({
      data,
      include: {
        customer: { select: { id: true, name: true } },
        product: { select: { id: true, code: true, displayName: true } },
        productGrade: {
          select: { id: true, gradeCode: true, gradeDisplayName: true },
        },
        uom: {
          select: { symbol: true, id: true, code: true, displayName: true },
        },
        currency: {
          select: { id: true, code: true, symbol: true, name: true },
        },
      },
    });
  },

  listByDomain(
    domainId: string,
    adminId: string,
    limit: number,
    offset: number,
    filter?: {
      status?: 'ACTIVE' | 'INACTIVE';
      customerId?: string;
      productId?: string;
      productGradeId?: string;
    },
  ) {
    const where: Prisma.CustomerRateWhereInput = {
      domainId,
      adminId,
      isDeleted: false,
      ...(filter?.status && { status: filter.status }),
      ...(filter?.customerId && { customerId: filter.customerId }),
      ...(filter?.productId && { productId: filter.productId }),
      ...(filter?.productGradeId && { productGradeId: filter.productGradeId }),
    };

    return prisma.$transaction([
      prisma.customerRate.count({ where }),
      prisma.customerRate.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { id: true, name: true } },
          product: { select: { id: true, code: true, displayName: true } },
          productGrade: {
            select: { id: true, gradeCode: true, gradeDisplayName: true },
          },
          uom: {
            select: { symbol: true, id: true, code: true, displayName: true },
          },
          currency: {
            select: { id: true, code: true, symbol: true, name: true },
          },
        },
      }),
    ]);
  },

  findByIdAndDomain(id: string, domainId: string, adminId: string) {
    return prisma.customerRate.findFirst({
      where: { id, domainId, adminId, isDeleted: false },
      include: {
        customer: { select: { id: true, name: true } },
        product: { select: { id: true, code: true, displayName: true } },
        productGrade: {
          select: { id: true, gradeCode: true, gradeDisplayName: true },
        },
        uom: {
          select: { symbol: true, id: true, code: true, displayName: true },
        },
        currency: {
          select: { id: true, code: true, symbol: true, name: true },
        },
      },
    });
  },

  update(id: string, data: Prisma.CustomerRateUncheckedUpdateInput) {
    return prisma.customerRate.update({ where: { id }, data });
  },

  softDelete(id: string) {
    return prisma.customerRate.update({
      where: { id },
      data: { isDeleted: true, status: 'INACTIVE' },
    });
  },
};
