import { Prisma } from '@infra/database/prisma/generated/prisma/client/client';
import prisma from '../infra/database/prisma/prisma.client.js';

export const uomRepository = {
  create(data: Prisma.UomUncheckedCreateInput) {
    return prisma.uom.create({ data });
  },

  findActiveByCode(domainId: string, code: string) {
    return prisma.uom.findFirst({
      where: { domainId, code, isDeleted: false },
    });
  },

  findDuplicateCode(domainId: string, code: string, excludeId: string) {
    return prisma.uom.findFirst({
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
    const where: Prisma.UomWhereInput = {
      domainId,
      isDeleted: false,
      ...(filter?.status && { status: filter.status }),
      ...(searchKey && {
        searchText: { contains: searchKey, mode: 'insensitive' as const },
      }),
    };

    return prisma.$transaction([
      prisma.uom.count({ where }),
      prisma.uom.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
    ]);
  },

  findByIdAndDomain(id: string, domainId: string) {
    return prisma.uom.findFirst({
      where: { id, domainId, isDeleted: false },
    });
  },

  findActiveByIds(ids: string[]) {
    return prisma.uom.findMany({
      where: { id: { in: ids }, isDeleted: false },
    });
  },

  findActiveByBaseUomId(baseUomId: string) {
    return prisma.uom.findFirst({
      where: { baseUomId, isDeleted: false },
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
        ...(options.filters.codes && {
          code: { in: options.filters.codes },
        }),
      }),
    };
    return prisma.uom.findMany({
      where: whereClause,
      ...(options && { select: options.select }),
    });
  },

  update(id: string, data: Prisma.UomUncheckedUpdateInput) {
    return prisma.uom.update({ where: { id }, data });
  },

  softDelete(id: string) {
    return prisma.uom.update({
      where: { id },
      data: { isDeleted: true, status: 'INACTIVE' },
    });
  },

  async validateUomIds(domainId: string, ids: string[]) {
    const count = await prisma.uom.count({
      where: { domainId, id: { in: ids }, isDeleted: false },
    });
    return count === ids.length;
  },

  async validateUomCodes(domainId: string, codes: string[]) {
    const count = await prisma.uom.count({
      where: { domainId, code: { in: codes }, isDeleted: false },
    });
    return count === codes.length;
  },
};
