import { Prisma } from '@infra/database/prisma/generated/prisma/client/client';
import prisma from '../infra/database/prisma/prisma.client.js';

const productWithDetails = {
  productGrades: {
    where: { isDeleted: false },
    orderBy: { createdAt: 'desc' as const },
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
          // productGrade: {
          //   select: { id: true, gradeDisplayName: true, gradeCode: true },
          // },
        },
      },
      // inventories: {
      //   where: { isDeleted: false },
      //   select: {
      //     id: true,
      //     quantity: true,
      //     reorderLevel: true,
      //     status: true,
      //     uom: {
      //       select: { id: true, displayName: true, code: true },
      //     },
      //   },
      // },
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
  inventories: {
    where: { isDeleted: false },
    orderBy: { createdAt: 'desc' as const },
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
} satisfies Prisma.ProductInclude;

export const ProductRepository = {
  create(data: Prisma.ProductUncheckedCreateInput) {
    return prisma.product.create({ data });
  },

  findActiveByCode(domainId: string, code: string) {
    return prisma.product.findFirst({
      where: { domainId, code, isDeleted: false },
    });
  },

  findDuplicateCode(domainId: string, code: string, excludeId: string) {
    return prisma.product.findFirst({
      where: { domainId, code, isDeleted: false, NOT: { id: excludeId } },
    });
  },

  listByDomain(
    domainId: string,
    limit: number,
    offset: number,
    filter?: { status?: string; searchKey?: string },
  ) {
    const searchKey = filter?.searchKey?.trim() || '';
    return prisma.$transaction([
      prisma.product.count({
        where: {
          domainId,
          isDeleted: false,
          ...(filter?.status && { status: filter.status }),
          ...(searchKey && {
            searchText: {
              contains: searchKey,
              mode: 'insensitive',
            },
          }),
        },
      }),
      prisma.product.findMany({
        where: {
          domainId,
          isDeleted: false,
          ...(filter?.status && { status: filter.status }),
          ...(searchKey && {
            searchText: {
              contains: searchKey,
              mode: 'insensitive',
            },
          }),
        },
        include: productWithDetails, // ← full nested details now
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
    ]);
  },

  findByIdAndDomain(id: string, domainId: string) {
    return prisma.product.findFirst({
      where: { id, domainId, isDeleted: false },
      include: productWithDetails, // ← full nested details now
    });
  },

  // Keep the verbose version if you need it elsewhere, or remove it
  findByIdWithDetails(id: string, domainId: string) {
    return prisma.product.findFirst({
      where: { id, domainId, isDeleted: false },
      include: productWithDetails,
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
