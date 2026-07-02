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

  postDraft(id: string, domainId: string, adminId: string) {
    return prisma.$transaction(
      async (tx) => {
        const journal = await tx.journalEntry.findFirst({
          where: { id, domainId, adminId, status: 'DRAFT', isDeleted: false },
          include: {
            fiscalYear: {
              select: { startDate: true, endDate: true, isClosed: true },
            },
            accountingPeriod: {
              select: {
                fiscalYearId: true,
                startDate: true,
                endDate: true,
                isClosed: true,
              },
            },
            lines: {
              where: { status: 'ACTIVE' },
              orderBy: { lineNo: 'asc' },
              include: {
                account: {
                  select: {
                    status: true,
                    isDeleted: true,
                    isActive: true,
                    isPostingAllowed: true,
                  },
                },
              },
            },
          },
        });

        if (!journal) throw new Error('DRAFT journal entry not found');
        if (journal.fiscalYear.isClosed) {
          throw new Error('Journal entry cannot post to a closed fiscal year');
        }
        if (
          journal.accountingPeriod.isClosed ||
          journal.accountingPeriod.fiscalYearId !== journal.fiscalYearId
        ) {
          throw new Error(
            'Journal entry cannot post to a closed or invalid accounting period',
          );
        }
        if (
          journal.postingDate < journal.accountingPeriod.startDate ||
          journal.postingDate > journal.accountingPeriod.endDate
        ) {
          throw new Error('Posting date must be inside the accounting period');
        }
        if (journal.lines.length < 2) {
          throw new Error(
            'Journal entry must contain at least two active lines',
          );
        }

        let totalDebit = new Prisma.Decimal(0);
        let totalCredit = new Prisma.Decimal(0);
        for (const line of journal.lines) {
          if (
            line.account.status !== 'ACTIVE' ||
            line.account.isDeleted ||
            !line.account.isActive ||
            !line.account.isPostingAllowed
          ) {
            throw new Error(
              'Journal entry contains an invalid posting account',
            );
          }
          const hasDebit = line.debitAmount.greaterThan(0);
          const hasCredit = line.creditAmount.greaterThan(0);
          if (hasDebit === hasCredit) {
            throw new Error(
              'Each journal line must contain either debit or credit',
            );
          }
          totalDebit = totalDebit.plus(line.debitAmount);
          totalCredit = totalCredit.plus(line.creditAmount);
        }

        if (
          totalDebit.lessThanOrEqualTo(0) ||
          !totalDebit.equals(totalCredit)
        ) {
          throw new Error('Journal entry total debit must equal total credit');
        }
        if (
          await tx.generalLedgerEntry.count({
            where: { journalEntryId: journal.id },
          })
        ) {
          throw new Error('Journal entry has already created ledger entries');
        }

        const claimed = await tx.journalEntry.updateMany({
          where: {
            id,
            domainId,
            adminId,
            status: 'DRAFT',
            isDeleted: false,
          },
          data: {
            status: 'POSTED',
            totalDebit,
            totalCredit,
            postedBy: adminId,
            postedAt: new Date(),
          },
        });
        if (claimed.count !== 1) {
          throw new Error('Journal entry has already been posted');
        }

        await tx.generalLedgerEntry.createMany({
          data: journal.lines.map((line) => ({
            journalEntryId: journal.id,
            journalEntryLineId: line.id,
            accountId: line.accountId,
            transactionDate: journal.transactionDate,
            postingDate: journal.postingDate,
            fiscalYearId: journal.fiscalYearId,
            accountingPeriodId: journal.accountingPeriodId,
            debitAmount: line.debitAmount,
            creditAmount: line.creditAmount,
            costCenterId: line.costCenterId,
            projectId: line.projectId,
            sourceDocumentId: journal.sourceDocumentId,
            sourceDocumentType: journal.sourceDocumentType,
            adminId,
            domainId,
          })),
        });

        const balanceChanges = new Map<
          string,
          {
            accountId: string;
            costCenterId: string;
            debit: Prisma.Decimal;
            credit: Prisma.Decimal;
          }
        >();
        for (const line of journal.lines) {
          const key = `${line.accountId}:${line.costCenterId}`;
          const current = balanceChanges.get(key);
          if (current) {
            current.debit = current.debit.plus(line.debitAmount);
            current.credit = current.credit.plus(line.creditAmount);
          } else {
            balanceChanges.set(key, {
              accountId: line.accountId,
              costCenterId: line.costCenterId,
              debit: line.debitAmount,
              credit: line.creditAmount,
            });
          }
        }

        for (const change of balanceChanges.values()) {
          const balance = await tx.accountBalance.upsert({
            where: {
              domainId_fiscalYearId_accountingPeriodId_accountId_costCenterId: {
                domainId,
                fiscalYearId: journal.fiscalYearId,
                accountingPeriodId: journal.accountingPeriodId,
                accountId: change.accountId,
                costCenterId: change.costCenterId,
              },
            },
            create: {
              accountId: change.accountId,
              fiscalYearId: journal.fiscalYearId,
              accountingPeriodId: journal.accountingPeriodId,
              costCenterId: change.costCenterId,
              periodDebit: change.debit,
              periodCredit: change.credit,
              closingDebit: change.debit.greaterThanOrEqualTo(change.credit)
                ? change.debit.minus(change.credit)
                : new Prisma.Decimal(0),
              closingCredit: change.credit.greaterThan(change.debit)
                ? change.credit.minus(change.debit)
                : new Prisma.Decimal(0),
              lastJournalEntryId: journal.id,
              adminId,
              domainId,
            },
            update: {
              periodDebit: { increment: change.debit },
              periodCredit: { increment: change.credit },
              lastJournalEntryId: journal.id,
              adminId,
            },
          });

          const netBalance = balance.openingDebit
            .plus(balance.periodDebit)
            .minus(balance.openingCredit)
            .minus(balance.periodCredit);
          await tx.accountBalance.update({
            where: { id: balance.id },
            data: {
              closingDebit: netBalance.greaterThanOrEqualTo(0)
                ? netBalance
                : new Prisma.Decimal(0),
              closingCredit: netBalance.lessThan(0)
                ? netBalance.abs()
                : new Prisma.Decimal(0),
            },
          });
        }

        return tx.journalEntry.findUniqueOrThrow({
          where: { id },
          include: { lines: { orderBy: { lineNo: 'asc' } } },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  },

  reversePosted(id: string, domainId: string, adminId: string) {
    return prisma.$transaction(
      async (tx) => {
        const journal = await tx.journalEntry.findFirst({
          where: { id, domainId, adminId, status: 'POSTED', isDeleted: false },
          include: {
            lines: {
              where: { status: 'ACTIVE' },
              orderBy: { lineNo: 'asc' },
              include: { account: { select: { path: true } } },
            },
          },
        });

        if (!journal) throw new Error('POSTED journal entry not found');
        if (journal.lines.length === 0) {
          throw new Error(
            'Journal entry must contain at least one active line',
          );
        }

        // Decide where to post the reversal. Never rewrite a locked period: if
        // the original fiscal year / period is closed, post the reversal into
        // the current open period; otherwise mirror the original's period/date.
        let reversalDate = journal.postingDate;
        let reversalFiscalYearId = journal.fiscalYearId;
        let reversalPeriodId = journal.accountingPeriodId;

        const [origFiscalYear, origPeriod] = await Promise.all([
          tx.fiscalYear.findFirst({
            where: { id: journal.fiscalYearId, domainId },
            select: { isClosed: true },
          }),
          tx.accountingPeriod.findFirst({
            where: { id: journal.accountingPeriodId, domainId },
            select: { isClosed: true },
          }),
        ]);

        if (origFiscalYear?.isClosed || origPeriod?.isClosed) {
          const today = new Date();
          const openPeriod = await tx.accountingPeriod.findFirst({
            where: {
              domainId,
              isClosed: false,
              startDate: { lte: today },
              endDate: { gte: today },
            },
            select: { id: true, fiscalYearId: true },
          });
          if (!openPeriod) {
            throw new Error('No open accounting period to post the reversal');
          }
          const openFiscalYear = await tx.fiscalYear.findFirst({
            where: { id: openPeriod.fiscalYearId, domainId },
            select: { isClosed: true },
          });
          if (!openFiscalYear || openFiscalYear.isClosed) {
            throw new Error('No open fiscal year to post the reversal');
          }
          reversalDate = today;
          reversalFiscalYearId = openPeriod.fiscalYearId;
          reversalPeriodId = openPeriod.id;
        }

        // Create the reversal as its own POSTED counter-voucher (linked back
        // to the original via sourceDocumentId; original links here below).
        const reversal = await tx.journalEntry.create({
          data: {
            voucherNo: `REV-${journal.voucherNo}`,
            voucherType: 'Reversal',
            transactionDate: reversalDate,
            postingDate: reversalDate,
            referenceNo: journal.referenceNo,
            narration: `Reversal of ${journal.voucherNo}`,
            totalDebit: journal.totalCredit,
            totalCredit: journal.totalDebit,
            currencyId: journal.currencyId,
            exchangeRate: journal.exchangeRate,
            status: 'POSTED',
            entryType: 'AUTO',
            sourceDocumentType: 'JOURNAL_REVERSAL',
            sourceDocumentId: journal.id,
            fiscalYearId: reversalFiscalYearId,
            accountingPeriodId: reversalPeriodId,
            vendorId: journal.vendorId,
            customerId: journal.customerId,
            costCenterId: journal.costCenterId,
            projectId: journal.projectId,
            domainId,
            adminId,
            createdBy: adminId,
            postedBy: adminId,
            postedAt: new Date(),
          },
        });

        // Reversal lines = original ACTIVE lines with debit/credit swapped.
        const reversedLines = [];
        let lineNo = 1;
        for (const line of journal.lines) {
          const reversedLine = await tx.journalEntryLine.create({
            data: {
              journalEntryId: reversal.id,
              lineNo: lineNo++,
              accountId: line.accountId,
              debitAmount: line.creditAmount,
              creditAmount: line.debitAmount,
              transactionCurrencyDebit: line.transactionCurrencyCredit,
              transactionCurrencyCredit: line.transactionCurrencyDebit,
              exchangeRate: line.exchangeRate,
              description: line.description,
              referenceNo: line.referenceNo,
              costCenterId: line.costCenterId,
              projectId: line.projectId,
              reconciledAmount: 0,
              isReconciled: false,
              status: 'ACTIVE',
              vendorId: line.vendorId,
              customerId: line.customerId,
              adminId,
              domainId,
            },
          });
          reversedLines.push(reversedLine);
        }

        await tx.generalLedgerEntry.createMany({
          data: reversedLines.map((line) => ({
            journalEntryId: reversal.id,
            journalEntryLineId: line.id,
            accountId: line.accountId,
            transactionDate: reversal.transactionDate,
            postingDate: reversal.postingDate,
            fiscalYearId: reversal.fiscalYearId,
            accountingPeriodId: reversal.accountingPeriodId,
            debitAmount: line.debitAmount,
            creditAmount: line.creditAmount,
            costCenterId: line.costCenterId,
            projectId: line.projectId,
            sourceDocumentId: reversal.sourceDocumentId,
            sourceDocumentType: reversal.sourceDocumentType,
            adminId,
            domainId,
          })),
        });

        // Leaf account id -> materialized path ("rootId/.../leafId"), from the
        // original lines (the reversed lines mirror them 1:1).
        const accountPathById = new Map<string, string>();
        for (const line of journal.lines) {
          if (line.account?.path) {
            accountPathById.set(line.accountId, line.account.path);
          }
        }

        const balanceChanges = new Map<
          string,
          {
            accountId: string;
            costCenterId: string;
            debit: Prisma.Decimal;
            credit: Prisma.Decimal;
          }
        >();
        const applyChange = (
          accountId: string,
          costCenterId: string,
          debit: Prisma.Decimal,
          credit: Prisma.Decimal,
        ) => {
          const key = `${accountId}:${costCenterId}`;
          const current = balanceChanges.get(key);
          if (current) {
            current.debit = current.debit.plus(debit);
            current.credit = current.credit.plus(credit);
          } else {
            balanceChanges.set(key, { accountId, costCenterId, debit, credit });
          }
        };

        for (const line of reversedLines) {
          // The postable leaf account itself.
          applyChange(
            line.accountId,
            line.costCenterId,
            line.debitAmount,
            line.creditAmount,
          );
          // Roll the same movement up to every ancestor account (parent, ...,
          // root) so summary balances stay in sync. Ancestors are the path
          // segments excluding the leaf's own id (the last segment).
          const path = accountPathById.get(line.accountId);
          if (path) {
            const segments = path.split('/').filter(Boolean);
            const ancestorIds = segments.slice(0, -1);
            for (const ancestorId of ancestorIds) {
              applyChange(
                ancestorId,
                line.costCenterId,
                line.debitAmount,
                line.creditAmount,
              );
            }
          }
        }

        for (const change of balanceChanges.values()) {
          const balance = await tx.accountBalance.upsert({
            where: {
              domainId_fiscalYearId_accountingPeriodId_accountId_costCenterId: {
                domainId,
                fiscalYearId: reversal.fiscalYearId,
                accountingPeriodId: reversal.accountingPeriodId,
                accountId: change.accountId,
                costCenterId: change.costCenterId,
              },
            },
            create: {
              accountId: change.accountId,
              fiscalYearId: reversal.fiscalYearId,
              accountingPeriodId: reversal.accountingPeriodId,
              costCenterId: change.costCenterId,
              periodDebit: change.debit,
              periodCredit: change.credit,
              closingDebit: change.debit.greaterThanOrEqualTo(change.credit)
                ? change.debit.minus(change.credit)
                : new Prisma.Decimal(0),
              closingCredit: change.credit.greaterThan(change.debit)
                ? change.credit.minus(change.debit)
                : new Prisma.Decimal(0),
              lastJournalEntryId: reversal.id,
              adminId,
              domainId,
            },
            update: {
              periodDebit: { increment: change.debit },
              periodCredit: { increment: change.credit },
              lastJournalEntryId: reversal.id,
              adminId,
            },
          });

          const netBalance = balance.openingDebit
            .plus(balance.periodDebit)
            .minus(balance.openingCredit)
            .minus(balance.periodCredit);
          await tx.accountBalance.update({
            where: { id: balance.id },
            data: {
              closingDebit: netBalance.greaterThanOrEqualTo(0)
                ? netBalance
                : new Prisma.Decimal(0),
              closingCredit: netBalance.lessThan(0)
                ? netBalance.abs()
                : new Prisma.Decimal(0),
            },
          });
        }

        // Atomically flip the original to REVERSED and link the reversal. The
        // WHERE status='POSTED' guard makes a concurrent double-reversal fail
        // (count 0 → throw → the whole transaction, incl. the reversal, rolls
        // back), so a journal can never be reversed twice.
        const claimed = await tx.journalEntry.updateMany({
          where: {
            id,
            domainId,
            adminId,
            status: 'POSTED',
            isDeleted: false,
          },
          data: {
            status: 'REVERSED',
            reversalDate: new Date(),
            reversalJournalId: reversal.id,
          },
        });
        if (claimed.count !== 1) {
          throw new Error('Journal entry has already been reversed');
        }

        return tx.journalEntry.findUniqueOrThrow({
          where: { id },
          include: { lines: { orderBy: { lineNo: 'asc' } } },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  },
};
