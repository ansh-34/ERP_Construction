import prisma from '../infra/database/prisma/prisma.client.js';

export const ProductGradeRepository = {
  validateProductGradeIds(domainId: string, ids: string[]) {
    if (ids.length === 0) {
      return true;
    }
    return prisma.productGrades
      .count({
        where: { id: { in: ids }, isDeleted: false, domainId },
      })
      .then((count) => count === ids.length);
  },

  validateProductGradeCodes(domainId: string, codes: string[]) {
    if (codes.length === 0) {
      return true;
    }
    return prisma.productGrades
      .count({
        where: { gradeCode: { in: codes }, isDeleted: false, domainId },
      })
      .then((count) => count === codes.length);
  },

  count(
    domainId: string,
    filter?: {
      searchKey?: string;
      status?: 'ACTIVE' | 'INACTIVE';
      productId?: string;
    },
  ) {
    const searchKey = filter?.searchKey?.trim() || '';
    return prisma.productGrades.count({
      where: {
        domainId,
        isDeleted: false,
        ...(filter?.status && { status: filter.status }),
        ...(filter?.productId && { productId: filter.productId }),
        ...(searchKey && {
          searchText: {
            contains: searchKey,
            mode: 'insensitive',
          },
        }),
      },
    });
  },

  find(
    domainId: string,
    options?: {
      filters?: {
        searchKey?: string;
        status?: 'ACTIVE' | 'INACTIVE';
        ids?: string[];
        gradeCodes?: string[];
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
        ...(options.filters.gradeCodes && {
          gradeCode: { in: options.filters.gradeCodes },
        }),
      }),
    };
    return prisma.productGrades.findMany({
      where: whereClause,
      ...(options && { select: options.select }),
    });
  },
};
