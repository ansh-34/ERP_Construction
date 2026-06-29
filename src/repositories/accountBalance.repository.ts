import { Prisma } from '@infra/database/prisma/generated/prisma/client/client';
import prisma from '../infra/database/prisma/prisma.client.js';

export const accountBalanceRepository = {
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
    const where: Prisma.AccountBalanceWhereInput = {
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
        createdAt: {
          ...(filter?.from && { gte: new Date(filter.from) }),
          ...(filter?.to && { lte: new Date(filter.to) }),
        },
      }),
    };

    return prisma.$transaction([
      prisma.accountBalance.count({ where }),
      prisma.accountBalance.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: [{ updatedAt: 'desc' }],
        include: { account: true },
      }),
    ]);
  },

  findByIdAndDomain(id: string, domainId: string, adminId: string) {
    return prisma.accountBalance.findFirst({
      where: { id, domainId, adminId },
      include: { account: true },
    });
  },
};
