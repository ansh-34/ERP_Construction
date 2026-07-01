import { Prisma } from '@infra/database/prisma/generated/prisma/client/client';
import prisma from '../infra/database/prisma/prisma.client.js';

export const journalEntryRepository = {
  create(data: Prisma.JournalEntryUncheckedCreateInput) {
    return prisma.journalEntry.create({ data });
  },

  findById(id: string, domainId: string, adminId: string) {
    return prisma.journalEntry.findFirst({
      where: { id, domainId, adminId, isDeleted: false },
    });
  },

  findDuplicateVoucher(
    voucherNo: string,
    domainId: string,
    fiscalYearId: string,
    excludeId?: string,
  ) {
    return prisma.journalEntry.findFirst({
      where: {
        voucherNo,
        domainId,
        fiscalYearId,
        isDeleted: false,
        ...(excludeId && { NOT: { id: excludeId } }),
      },
      select: { id: true },
    });
  },

  list(
    domainId: string,
    adminId: string,
    limit: number,
    offset: number,
    filter?: {
      status?: 'DRAFT' | 'POSTED' | 'REVERSED';
      entryType?: 'AUTO' | 'MANUAL';
      voucherType?: string;
      fiscalYearId?: string;
      accountingPeriodId?: string;
      projectId?: string;
      costCenterId?: string;
      fromDate?: Date;
      toDate?: Date;
      searchKey?: string;
    },
  ) {
    const where: Prisma.JournalEntryWhereInput = {
      domainId,
      adminId,
      isDeleted: false,
      ...(filter?.status && { status: filter.status }),
      ...(filter?.entryType && { entryType: filter.entryType }),
      ...(filter?.voucherType && { voucherType: filter.voucherType }),
      ...(filter?.fiscalYearId && { fiscalYearId: filter.fiscalYearId }),
      ...(filter?.accountingPeriodId && {
        accountingPeriodId: filter.accountingPeriodId,
      }),
      ...(filter?.projectId && { projectId: filter.projectId }),
      ...(filter?.costCenterId && { costCenterId: filter.costCenterId }),
      ...(filter?.fromDate || filter?.toDate
        ? {
            transactionDate: {
              ...(filter.fromDate && { gte: filter.fromDate }),
              ...(filter.toDate && { lte: filter.toDate }),
            },
          }
        : {}),
      ...(filter?.searchKey && {
        OR: [
          {
            voucherNo: {
              contains: filter.searchKey,
              mode: 'insensitive',
            },
          },
          {
            referenceNo: {
              contains: filter.searchKey,
              mode: 'insensitive',
            },
          },
          {
            externalReferenceNo: {
              contains: filter.searchKey,
              mode: 'insensitive',
            },
          },
          {
            narration: {
              contains: filter.searchKey,
              mode: 'insensitive',
            },
          },
        ],
      }),
    };

    return prisma.$transaction([
      prisma.journalEntry.count({ where }),
      prisma.journalEntry.findMany({
        where,
        orderBy: [{ transactionDate: 'desc' }, { createdAt: 'desc' }],
        skip: offset,
        take: limit,
      }),
    ]);
  },

  findFiscalYear(id: string, domainId: string) {
    return prisma.fiscalYear.findFirst({
      where: { id, domainId },
      select: { id: true, startDate: true, endDate: true, isClosed: true },
    });
  },

  findAccountingPeriod(id: string, fiscalYearId: string, domainId: string) {
    return prisma.accountingPeriod.findFirst({
      where: { id, fiscalYearId, domainId },
      select: { id: true, startDate: true, endDate: true, isClosed: true },
    });
  },

  findCurrency(id: string) {
    return prisma.currency.findFirst({
      where: { id, status: 'ACTIVE', isDeleted: false },
      select: { id: true },
    });
  },

  findProject(id: string, domainId: string, adminId: string) {
    return prisma.project.findFirst({
      where: { id, domainId, adminId, status: 'ACTIVE', isDeleted: false },
      select: { id: true },
    });
  },

  findCostCenter(id: string, domainId: string, adminId: string) {
    return prisma.costCenter.findFirst({
      where: { id, domainId, adminId, status: 'ACTIVE', isDeleted: false },
      select: { id: true },
    });
  },

  findVendor(id: string, domainId: string) {
    return prisma.vendor.findFirst({
      where: { id, domainId, status: 'ACTIVE', isDeleted: false },
      select: { id: true },
    });
  },

  findCustomer(id: string, domainId: string, adminId: string) {
    return prisma.customer.findFirst({
      where: { id, domainId, adminId, status: 'ACTIVE', isDeleted: false },
      select: { id: true },
    });
  },

  async updateDraft(
    id: string,
    domainId: string,
    adminId: string,
    data: Prisma.JournalEntryUncheckedUpdateManyInput,
  ) {
    const result = await prisma.journalEntry.updateMany({
      where: { id, domainId, adminId, status: 'DRAFT', isDeleted: false },
      data,
    });
    return result.count ? this.findById(id, domainId, adminId) : null;
  },

  async softDeleteDraft(id: string, domainId: string, adminId: string) {
    const result = await prisma.journalEntry.updateMany({
      where: { id, domainId, adminId, status: 'DRAFT', isDeleted: false },
      data: { isDeleted: true },
    });
    return result.count > 0;
  },
};
