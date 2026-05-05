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
        include: {
          _count: {
            select: {
              productGrades: { where: { isDeleted: false } },
              productUoms: { where: { isDeleted: false } },
              inventories: { where: { isDeleted: false } },
            },
          },
        },
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

  findByIdWithDetails(id: string, domainId: string) {
    return prisma.product.findFirst({
      where: { id, domainId, isDeleted: false },
      include: {
        productGrades: {
          where: { isDeleted: false },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            gradeDisplayName: true,
            gradeCode: true,
            status: true,
            createdAt: true,
            productGradeStdRates: {
              where: { isDeleted: false },
              select: {
                id: true,
                stdRateType: true,
                stdRateValue: true,
                alertThresold: true,
                status: true,
                createdAt: true,
              },
            },
            inventories: {
              where: { isDeleted: false },
              select: {
                id: true,
                quantity: true,
                reorderLevel: true,
                status: true,
                uom: {
                  select: { id: true, displayName: true, code: true },
                },
              },
            },
          },
        },
        productUoms: {
          where: { isDeleted: false },
          select: {
            id: true,
            status: true,
            createdAt: true,
            uom: {
              select: {
                id: true,
                displayName: true,
                code: true,
                conversionRate: true,
              },
            },
          },
        },
        productGradeStdRates: {
          where: { isDeleted: false },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            stdRateType: true,
            stdRateValue: true,
            alertThresold: true,
            status: true,
            createdAt: true,
            productGrade: {
              select: { id: true, gradeDisplayName: true, gradeCode: true },
            },
          },
        },
        inventories: {
          where: { isDeleted: false },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            quantity: true,
            reorderLevel: true,
            status: true,
            createdAt: true,
            productGrade: {
              select: { id: true, gradeDisplayName: true, gradeCode: true },
            },
            uom: {
              select: { id: true, displayName: true, code: true },
            },
          },
        },
      },
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
