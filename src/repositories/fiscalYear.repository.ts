import { Prisma } from '@infra/database/prisma/generated/prisma/client/client';
import prisma from '../infra/database/prisma/prisma.client.js';

const fiscalYearSelect = {
  id: true,
  name: true,
  startDate: true,
  endDate: true,
  isClosed: true,
  closedAt: true,
  closedBy: true,
  closedByUserId: true,
  adminId: true,
  domainId: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.FiscalYearSelect;

export const fiscalYearRepository = {
  create(data: Prisma.FiscalYearUncheckedCreateInput) {
    return prisma.fiscalYear.create({ data, select: fiscalYearSelect });
  },

  findById(id: string, domainId: string) {
    return prisma.fiscalYear.findFirst({
      where: { id, domainId },
      select: fiscalYearSelect,
    });
  },

  findByName(name: string, domainId: string, excludeId?: string) {
    return prisma.fiscalYear.findFirst({
      where: {
        name,
        domainId,
        ...(excludeId && { NOT: { id: excludeId } }),
      },
      select: { id: true },
    });
  },

  findOverlapping(
    domainId: string,
    startDate: Date,
    endDate: Date,
    excludeId?: string,
  ) {
    return prisma.fiscalYear.findFirst({
      where: {
        domainId,
        startDate: { lte: endDate },
        endDate: { gte: startDate },
        ...(excludeId && { NOT: { id: excludeId } }),
      },
      select: { id: true, name: true, startDate: true, endDate: true },
    });
  },

  list(
    domainId: string,
    limit: number,
    offset: number,
    filter?: { isClosed?: boolean; searchKey?: string },
  ) {
    const where: Prisma.FiscalYearWhereInput = {
      domainId,
      ...(filter?.isClosed !== undefined && { isClosed: filter.isClosed }),
      ...(filter?.searchKey && {
        name: { contains: filter.searchKey, mode: 'insensitive' },
      }),
    };

    return prisma.$transaction([
      prisma.fiscalYear.count({ where }),
      prisma.fiscalYear.findMany({
        where,
        select: fiscalYearSelect,
        orderBy: [{ startDate: 'desc' }, { createdAt: 'desc' }],
        skip: offset,
        take: limit,
      }),
    ]);
  },

  async updateOpen(
    id: string,
    domainId: string,
    data: Prisma.FiscalYearUncheckedUpdateManyInput,
  ) {
    const result = await prisma.fiscalYear.updateMany({
      where: { id, domainId, isClosed: false },
      data,
    });

    return result.count ? this.findById(id, domainId) : null;
  },

  async close(
    id: string,
    domainId: string,
    actor: { adminId?: string; userId?: string },
  ) {
    const result = await prisma.fiscalYear.updateMany({
      where: { id, domainId, isClosed: false },
      data: {
        isClosed: true,
        closedAt: new Date(),
        closedBy: actor.adminId,
        closedByUserId: actor.userId,
      },
    });

    return result.count ? this.findById(id, domainId) : null;
  },
};
