import { Prisma } from '@infra/database/prisma/generated/prisma/client/client';
import prisma from '../infra/database/prisma/prisma.client.js';

export const vendorRepository = {
  create(data: Prisma.VendorUncheckedCreateInput) {
    return prisma.vendor.create({ data });
  },

  findActiveByCode(domainId: string, code: string, excludeId?: string) {
    return prisma.vendor.findFirst({
      where: {
        domainId,
        code,
        isDeleted: false,
        ...(excludeId && { NOT: { id: excludeId } }),
      },
    });
  },

  findActiveByEmail(domainId: string, email: string, excludeId?: string) {
    return prisma.vendor.findFirst({
      where: {
        domainId,
        email,
        isDeleted: false,
        ...(excludeId && { NOT: { id: excludeId } }),
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
    const where: Prisma.VendorWhereInput = {
      domainId,
      isDeleted: false,
      ...(filter?.status && { status: filter.status }),
      ...(searchKey && {
        searchText: { contains: searchKey, mode: 'insensitive' as const },
      }),
    };

    return prisma.$transaction([
      prisma.vendor.count({ where }),
      prisma.vendor.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
    ]);
  },

  findByIdAndDomain(id: string, domainId: string) {
    return prisma.vendor.findFirst({
      where: { id, domainId, isDeleted: false },
    });
  },

  update(id: string, data: Prisma.VendorUncheckedUpdateInput) {
    return prisma.vendor.update({ where: { id }, data });
  },

  softDelete(id: string) {
    return prisma.vendor.update({
      where: { id },
      data: { isDeleted: true, status: 'INACTIVE' },
    });
  },

  async validateVendorIds(domainId: string, vendorIds: string[]) {
    return prisma.vendor
      .count({
        where: {
          id: { in: vendorIds },
          domainId,
          isDeleted: false,
        },
      })
      .then((count) => count === vendorIds.length);
  },

  validateVendorNames(domainId: string, names: string[]) {
    if (names.length === 0) {
      return true;
    }
    return prisma.vendor
      .count({
        where: { name: { in: names }, isDeleted: false, domainId },
      })
      .then((count) => count === names.length);
  },

  find(
    domainId: string,
    options?: {
      filters?: {
        searchKey?: string;
        status?: 'ACTIVE' | 'INACTIVE';
        ids?: string[];
        names?: string[];
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
        ...(options.filters.names && {
          name: { in: options.filters.names },
        }),
      }),
    };
    return prisma.vendor.findMany({
      where: whereClause,
      ...(options && { select: options.select }),
    });
  },
};
