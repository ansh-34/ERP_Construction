import { Prisma } from '@infra/database/prisma/generated/prisma/client/client';
import prisma from '../infra/database/prisma/prisma.client.js';

export const vendorProductPriceRepository = {
  create(data: Prisma.VendorProductPricingUncheckedCreateInput) {
    return prisma.vendorProductPricing.create({ data });
  },

  createMany(data: Prisma.VendorProductPricingUncheckedCreateInput[]) {
    return prisma.vendorProductPricing.createMany({
      data,
      skipDuplicates: true,
    });
  },

  findUnique(
    vendorName: string,
    productId: string,
    productGradeId: string,
    uomId: string,
    domainId: string,
  ) {
    return prisma.vendorProductPricing.findFirst({
      where: {
        vendorName,
        productId,
        productGradeId,
        uomId,
        domainId,
        isDeleted: false,
      },
    });
  },

  listByDomain(
    domainId: string,
    limit: number,
    offset: number,
    filter?: { status?: 'ACTIVE' | 'INACTIVE'; searchKey?: string },
  ) {
    const searchKey = filter?.searchKey?.trim() || '';
    const where: Prisma.VendorProductPricingWhereInput = {
      domainId,
      isDeleted: false,
      ...(filter?.status && { status: filter.status }),
      ...(searchKey && {
        searchText: { contains: searchKey, mode: 'insensitive' as const },
      }),
    };

    return prisma.$transaction([
      prisma.vendorProductPricing.count({ where }),
      prisma.vendorProductPricing.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { displayName: true, code: true } },
          productGrade: { select: { gradeDisplayName: true, gradeCode: true } },
          uom: { select: { displayName: true, code: true } },
        },
      }),
    ]);
  },

  findByIdAndDomain(id: string, domainId: string) {
    return prisma.vendorProductPricing.findFirst({
      where: { id, domainId, isDeleted: false },
      include: {
        product: { select: { displayName: true, code: true } },
        productGrade: { select: { gradeDisplayName: true, gradeCode: true } },
        uom: { select: { displayName: true, code: true } },
      },
    });
  },

  update(id: string, data: Prisma.VendorProductPricingUncheckedUpdateInput) {
    return prisma.vendorProductPricing.update({ where: { id }, data });
  },

  softDelete(id: string) {
    return prisma.vendorProductPricing.update({
      where: { id },
      data: { isDeleted: true, status: 'INACTIVE' },
    });
  },

  findAllByDomain(domainId: string) {
    return prisma.vendorProductPricing.findMany({
      where: { domainId, isDeleted: false },
      include: {
        product: { select: { displayName: true, code: true } },
        productGrade: { select: { gradeDisplayName: true, gradeCode: true } },
        uom: { select: { displayName: true, code: true } },
      },
    });
  },
};
