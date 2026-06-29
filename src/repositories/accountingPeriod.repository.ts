import { Prisma } from '@infra/database/prisma/generated/prisma/client/client';
import prisma from '../infra/database/prisma/prisma.client.js';

const accountingPeriodSelect = {
  id: true,
  fiscalYearId: true,
  name: true,
  periodNo: true,
  startDate: true,
  endDate: true,
  isClosed: true,
  closedAt: true,
  closedBy: true,
  closedByUserId: true,
  domainId: true,
  adminId: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.AccountingPeriodSelect;

export const accountingPeriodRepository = {
  create(data: Prisma.AccountingPeriodUncheckedCreateInput) {
    return prisma.accountingPeriod.create({
      data,
      select: accountingPeriodSelect,
    });
  },

  findById(id: string, domainId: string) {
    return prisma.accountingPeriod.findFirst({
      where: { id, domainId },
      select: accountingPeriodSelect,
    });
  },

  findByName(
    fiscalYearId: string,
    name: string,
    domainId: string,
    excludeId?: string,
  ) {
    return prisma.accountingPeriod.findFirst({
      where: {
        fiscalYearId,
        name,
        domainId,
        ...(excludeId && { NOT: { id: excludeId } }),
      },
      select: { id: true },
    });
  },

  findByPeriodNo(
    fiscalYearId: string,
    periodNo: number,
    domainId: string,
    excludeId?: string,
  ) {
    return prisma.accountingPeriod.findFirst({
      where: {
        fiscalYearId,
        periodNo,
        domainId,
        ...(excludeId && { NOT: { id: excludeId } }),
      },
      select: { id: true },
    });
  },

  findOverlapping(
    fiscalYearId: string,
    domainId: string,
    startDate: Date,
    endDate: Date,
    excludeId?: string,
  ) {
    return prisma.accountingPeriod.findFirst({
      where: {
        fiscalYearId,
        domainId,
        startDate: { lte: endDate },
        endDate: { gte: startDate },
        ...(excludeId && { NOT: { id: excludeId } }),
      },
      select: { id: true },
    });
  },

  list(
    domainId: string,
    limit: number,
    offset: number,
    filter?: {
      fiscalYearId?: string;
      isClosed?: boolean;
      searchKey?: string;
    },
  ) {
    const where: Prisma.AccountingPeriodWhereInput = {
      domainId,
      ...(filter?.fiscalYearId && { fiscalYearId: filter.fiscalYearId }),
      ...(filter?.isClosed !== undefined && { isClosed: filter.isClosed }),
      ...(filter?.searchKey && {
        name: { contains: filter.searchKey, mode: 'insensitive' },
      }),
    };

    return prisma.$transaction([
      prisma.accountingPeriod.count({ where }),
      prisma.accountingPeriod.findMany({
        where,
        select: accountingPeriodSelect,
        orderBy: [{ startDate: 'desc' }, { periodNo: 'desc' }],
        skip: offset,
        take: limit,
      }),
    ]);
  },

  countOpen(fiscalYearId: string, domainId: string) {
    return prisma.accountingPeriod.count({
      where: { fiscalYearId, domainId, isClosed: false },
    });
  },

  countOutsideRange(
    fiscalYearId: string,
    domainId: string,
    startDate: Date,
    endDate: Date,
  ) {
    return prisma.accountingPeriod.count({
      where: {
        fiscalYearId,
        domainId,
        OR: [{ startDate: { lt: startDate } }, { endDate: { gt: endDate } }],
      },
    });
  },

  async updateOpen(
    id: string,
    domainId: string,
    data: Prisma.AccountingPeriodUncheckedUpdateManyInput,
  ) {
    const result = await prisma.accountingPeriod.updateMany({
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
    const result = await prisma.accountingPeriod.updateMany({
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
