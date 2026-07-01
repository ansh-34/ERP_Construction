import { Prisma } from '@infra/database/prisma/generated/prisma/client/client';
import prisma from '../infra/database/prisma/prisma.client.js';

export const generalLedgerEntryRepository = {
  listByDomain(
    domainId: string,
    adminId: string,
    limit: number,
    offset: number,
    filter?: {
      accountId?: string;
      fiscalYearId?: string;
      accountingPeriodId?: string;
      costCenterId?: string;
      projectId?: string;
      from?: string;
      to?: string;
    },
  ) {
    const where: Prisma.GeneralLedgerEntryWhereInput = {
      domainId,
      adminId,
      ...(filter?.accountId && { accountId: filter.accountId }),
      ...(filter?.fiscalYearId && { fiscalYearId: filter.fiscalYearId }),
      ...(filter?.accountingPeriodId && {
        accountingPeriodId: filter.accountingPeriodId,
      }),
      ...(filter?.costCenterId && { costCenterId: filter.costCenterId }),
      ...(filter?.projectId && { projectId: filter.projectId }),
      ...((filter?.from || filter?.to) && {
        postingDate: {
          ...(filter?.from && { gte: new Date(filter.from) }),
          ...(filter?.to && { lte: new Date(filter.to) }),
        },
      }),
    };

    return prisma.$transaction([
      prisma.generalLedgerEntry.count({ where }),
      prisma.generalLedgerEntry.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: [{ postingDate: 'asc' }, { createdAt: 'asc' }],
        include: { account: true },
      }),
    ]);
  },

  findByIdAndDomain(id: string, domainId: string, adminId: string) {
    return prisma.generalLedgerEntry.findFirst({
      where: { id, domainId, adminId },
      include: { account: true },
    });
  },
};
