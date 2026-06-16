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
  create(data: Prisma.ProductUncheckedCreateInput, tx?: any) {
    const client = tx || prisma;
    return client.product.create({ data });
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
    filter?: { status?: 'ACTIVE' | 'INACTIVE'; searchKey?: string },
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
        include: {
          _count: {
            select: {
              productGrades: { where: { isDeleted: false } },
              productUoms: { where: { isDeleted: false } },
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
      include: productWithDetails, // ← full nested details now
    });
  },

  find(
    domainId: string,
    options?: {
      filters?: {
        searchKey?: string;
        status?: 'ACTIVE' | 'INACTIVE';
        ids?: string[];
        codes?: string[];
      };
      select?: any;
    },
  ) {
    const whereClause: any = {
      domainId,
      isDeleted: false,
      ...(options?.filters && {
        ...(options.filters.searchKey && {
          searchText: {
            contains: options.filters.searchKey.trim(),
            mode: 'insensitive',
          },
        }),
        ...(options.filters.status && { status: options.filters.status }),
        ...(options.filters.ids && { id: { in: options.filters.ids } }),
        ...(options.filters.codes && { code: { in: options.filters.codes } }),
      }),
    };
    return prisma.product.findMany({
      where: whereClause,
      ...(options && { select: options.select }),
    });
  },

  // Keep the verbose version if you need it elsewhere, or remove it
  findByIdWithDetails(id: string, domainId: string) {
    return prisma.product.findFirst({
      where: { id, domainId, isDeleted: false },
      include: productWithDetails,
    });
  },

  update(id: string, data: Prisma.ProductUncheckedUpdateInput, tx?: any) {
    const client = tx || prisma;
    return client.product.update({
      where: { id },
      data,
    });
  },

  async softDelete(id: string) {
    const product = await prisma.product.findUnique({ where: { id } });
    const suffix = `_DEL_${Date.now()}`;
    return prisma.product.update({
      where: { id },
      data: {
        isDeleted: true,
        status: 'INACTIVE',
        code: (product?.code || id) + suffix,
      },
    });
  },

  async validateProductIds(domainId: string, productIds: string[]) {
    const count = await prisma.product.count({
      where: {
        id: { in: productIds },
        domainId,
        isDeleted: false,
      },
    });
    return count === productIds.length;
  },

  async validateProductCodes(domainId: string, productCodes: string[]) {
    const count = await prisma.product.count({
      where: {
        code: { in: productCodes },
        domainId,
        isDeleted: false,
      },
    });
    return count === productCodes.length;
  },

  async getStatsDetailed(domainId: string) {
    const where = { domainId, isDeleted: false };
    const [
      totalProducts,
      activeCount,
      inactiveCount,
      rawMaterialCount,
      finishedProductCount,
    ] = await prisma.$transaction([
      prisma.product.count({ where }),
      prisma.product.count({ where: { ...where, status: 'ACTIVE' } }),
      prisma.product.count({ where: { ...where, status: 'INACTIVE' } }),
      prisma.product.count({
        where: { ...where, productType: 'RAW_MATERIAL' },
      }),
      prisma.product.count({
        where: { ...where, productType: 'FINISHED_PRODUCT' },
      }),
    ]);

    return {
      totalProducts,
      activeCount,
      inactiveCount,
      rawMaterialCount,
      finishedProductCount,
    };
  },

  count(args: any): Promise<any> {
    return prisma.product.count(args) as Promise<any>;
  },

  findMany(args: any): Promise<any> {
    return prisma.product.findMany(args) as Promise<any>;
  },

  findFirst(args: any, tx?: any): Promise<any> {
    const client = tx || prisma;
    return client.product.findFirst(args) as Promise<any>;
  },
};
