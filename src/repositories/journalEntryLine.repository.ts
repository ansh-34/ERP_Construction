import { Prisma } from '@infra/database/prisma/generated/prisma/client/client';
import prisma from '../infra/database/prisma/prisma.client.js';
import type { TransactionClient } from '../infra/database/prisma/transaction.js';

export const journalEntryLineRepository = {
  create(
    data: Prisma.JournalEntryLineUncheckedCreateInput,
    options: { transaction?: TransactionClient } = {},
  ) {
    const client = options.transaction ?? prisma;
    return client.journalEntryLine.create({ data });
  },

  findById(id: string, domainId: string, adminId: string) {
    return prisma.journalEntryLine.findFirst({
      where: { id, domainId, adminId },
    });
  },

  findJournalEntry(id: string, domainId: string, adminId: string) {
    return prisma.journalEntry.findFirst({
      where: { id, domainId, adminId, isDeleted: false },
      select: { id: true, status: true },
    });
  },

  findAccount(id: string, domainId: string, adminId: string) {
    return prisma.account.findFirst({
      where: {
        id,
        domainId,
        adminId,
        status: 'ACTIVE',
        isDeleted: false,
        isPostingAllowed: true,
      },
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

  findDuplicateLine(
    journalEntryId: string,
    lineNo: number,
    domainId: string,
    adminId: string,
    excludeId?: string,
  ) {
    return prisma.journalEntryLine.findFirst({
      where: {
        journalEntryId,
        lineNo,
        domainId,
        adminId,
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
    filter: {
      journalEntryId?: string;
      accountId?: string;
      projectId?: string;
      costCenterId?: string;
      vendorId?: string;
      customerId?: string;
      status?: 'ACTIVE' | 'REVERSED';
      isReconciled?: boolean;
      searchKey?: string;
    },
  ) {
    const where: Prisma.JournalEntryLineWhereInput = {
      domainId,
      adminId,
      ...(filter.journalEntryId && {
        journalEntryId: filter.journalEntryId,
      }),
      ...(filter.accountId && { accountId: filter.accountId }),
      ...(filter.projectId && { projectId: filter.projectId }),
      ...(filter.costCenterId && { costCenterId: filter.costCenterId }),
      ...(filter.vendorId && { vendorId: filter.vendorId }),
      ...(filter.customerId && { customerId: filter.customerId }),
      ...(filter.status && { status: filter.status }),
      ...(filter.isReconciled !== undefined && {
        isReconciled: filter.isReconciled,
      }),
      ...(filter.searchKey && {
        OR: [
          {
            description: {
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
        ],
      }),
    };

    return prisma.$transaction([
      prisma.journalEntryLine.count({ where }),
      prisma.journalEntryLine.findMany({
        where,
        orderBy: [{ journalEntryId: 'asc' }, { lineNo: 'asc' }],
        skip: offset,
        take: limit,
      }),
    ]);
  },

  async update(
    id: string,
    domainId: string,
    adminId: string,
    data: Prisma.JournalEntryLineUncheckedUpdateManyInput,
  ) {
    const result = await prisma.journalEntryLine.updateMany({
      where: {
        id,
        domainId,
        adminId,
        journalEntry: { status: 'DRAFT', isDeleted: false },
      },
      data,
    });
    return result.count ? this.findById(id, domainId, adminId) : null;
  },

  async delete(id: string, domainId: string, adminId: string) {
    return prisma.$transaction(async (tx) => {
      const record = await tx.journalEntryLine.findFirst({
        where: {
          id,
          domainId,
          adminId,
          journalEntry: { status: 'DRAFT', isDeleted: false },
        },
        select: { id: true },
      });
      if (!record) return false;
      await tx.journalEntryLine.delete({ where: { id } });
      return true;
    });
  },
};
