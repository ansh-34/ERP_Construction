import type {
  JournalEntryType,
  JournalEntryStatus,
} from '../../../infra/database/prisma/generated/prisma/client/enums.js';
import {
  journalEntryLineRepository,
  journalEntryRepository,
} from '../../../repositories/index.js';
import { transaction } from '../../../infra/database/prisma/transaction.js';
import { normalizePagination } from '../../../utils/pagination.js';
import { normalizePrismaError } from '../../../utils/prismaError.js';

type JournalEntryInput = {
  voucherNo: string;
  voucherType: string;
  transactionDate: Date;
  postingDate: Date;
  referenceNo?: string | null;
  externalReferenceNo?: string | null;
  narration?: string | null;
  totalDebit?: number;
  totalCredit?: number;
  currencyId: string;
  exchangeRate?: number;
  entryType: JournalEntryType;
  sourceDocumentId?: string | null;
  sourceDocumentType?: string | null;
  isAdjustment?: boolean;
  isYearEndClosing?: boolean;
  fiscalYearId: string;
  accountingPeriodId: string;
  vendorId?: string | null;
  customerId?: string | null;
  costCenterId: string;
  projectId: string;
};

type NestedJournalEntryLineInput = {
  lineNo: number;
  accountId: string;
  debitAmount?: number;
  creditAmount?: number;
  transactionCurrencyDebit?: number;
  transactionCurrencyCredit?: number;
  exchangeRate?: number;
  description?: string | null;
  referenceNo?: string | null;
  costCenterId: string;
  projectId: string;
  reconciledAmount?: number;
  isReconciled?: boolean;
  vendorId?: string | null;
  customerId?: string | null;
};

type CreateJournalEntryInput = JournalEntryInput & {
  lines?: NestedJournalEntryLineInput[];
};

async function validateContext(
  domainId: string,
  adminId: string,
  data: JournalEntryInput,
) {
  const [
    fiscalYear,
    accountingPeriod,
    currency,
    project,
    costCenter,
    vendor,
    customer,
  ] = await Promise.all([
    journalEntryRepository.findFiscalYear(data.fiscalYearId, domainId),
    journalEntryRepository.findAccountingPeriod(
      data.accountingPeriodId,
      data.fiscalYearId,
      domainId,
    ),
    journalEntryRepository.findCurrency(data.currencyId),
    journalEntryRepository.findProject(data.projectId, domainId, adminId),
    journalEntryRepository.findCostCenter(data.costCenterId, domainId, adminId),
    data.vendorId
      ? journalEntryRepository.findVendor(data.vendorId, domainId)
      : Promise.resolve(null),
    data.customerId
      ? journalEntryRepository.findCustomer(data.customerId, domainId, adminId)
      : Promise.resolve(null),
  ]);

  if (!fiscalYear) throw new Error('Fiscal year not found');
  if (fiscalYear.isClosed) {
    throw new Error('Journal entry cannot use a closed fiscal year');
  }
  if (!accountingPeriod) throw new Error('Accounting period not found');
  if (accountingPeriod.isClosed) {
    throw new Error('Journal entry cannot use a closed accounting period');
  }
  if (!currency) throw new Error('Currency not found');
  if (!project) throw new Error('Project not found');
  if (!costCenter) throw new Error('Cost center not found');
  if (data.vendorId && !vendor) throw new Error('Vendor not found');
  if (data.customerId && !customer) throw new Error('Customer not found');

  if (
    data.transactionDate < fiscalYear.startDate ||
    data.transactionDate > fiscalYear.endDate
  ) {
    throw new Error('Transaction date must be inside the fiscal year');
  }
  if (
    data.postingDate < accountingPeriod.startDate ||
    data.postingDate > accountingPeriod.endDate
  ) {
    throw new Error('Posting date must be inside the accounting period');
  }
}

async function validateLineContext(
  domainId: string,
  adminId: string,
  line: NestedJournalEntryLineInput,
) {
  const [account, project, costCenter, vendor, customer] = await Promise.all([
    journalEntryLineRepository.findAccount(line.accountId, domainId, adminId),
    journalEntryLineRepository.findProject(line.projectId, domainId, adminId),
    journalEntryLineRepository.findCostCenter(
      line.costCenterId,
      domainId,
      adminId,
    ),
    line.vendorId
      ? journalEntryLineRepository.findVendor(line.vendorId, domainId)
      : Promise.resolve(null),
    line.customerId
      ? journalEntryLineRepository.findCustomer(
          line.customerId,
          domainId,
          adminId,
        )
      : Promise.resolve(null),
  ]);

  if (!account) throw new Error('Posting account not found');
  if (!project) throw new Error('Project not found');
  if (!costCenter) throw new Error('Cost center not found');
  if (line.vendorId && !vendor) throw new Error('Vendor not found');
  if (line.customerId && !customer) throw new Error('Customer not found');
}

export const JournalEntryService = {
  async create(
    domainId: string,
    adminId: string,
    data: CreateJournalEntryInput,
  ) {
    try {
      if (
        await journalEntryRepository.findDuplicateVoucher(
          data.voucherNo,
          domainId,
          data.fiscalYearId,
        )
      ) {
        throw new Error('duplicate voucher number');
      }

      await validateContext(domainId, adminId, data);
      const { lines = [], ...journalData } = data;
      await Promise.all(
        lines.map((line) => validateLineContext(domainId, adminId, line)),
      );

      const totalDebit = lines.reduce(
        (total, line) => total + (line.debitAmount ?? 0),
        0,
      );
      const totalCredit = lines.reduce(
        (total, line) => total + (line.creditAmount ?? 0),
        0,
      );

      return await transaction(async (tx) => {
        const journalEntry = await journalEntryRepository.create(
          {
            ...journalData,
            totalDebit,
            totalCredit,
            exchangeRate: data.exchangeRate ?? 1,
            status: 'DRAFT',
            domainId,
            adminId,
            createdBy: adminId,
          },
          { transaction: tx },
        );

        const createdLines = [];
        for (const line of lines) {
          createdLines.push(
            await journalEntryLineRepository.create(
              {
                ...line,
                journalEntryId: journalEntry.id,
                debitAmount: line.debitAmount ?? 0,
                creditAmount: line.creditAmount ?? 0,
                transactionCurrencyDebit: line.transactionCurrencyDebit ?? 0,
                transactionCurrencyCredit: line.transactionCurrencyCredit ?? 0,
                exchangeRate: line.exchangeRate ?? 1,
                reconciledAmount: line.reconciledAmount ?? 0,
                isReconciled: line.isReconciled ?? false,
                status: 'ACTIVE',
                domainId,
                adminId,
              },
              { transaction: tx },
            ),
          );
        }

        return { ...journalEntry, lines: createdLines };
      });
    } catch (error) {
      console.error('[JournalEntryService.create] Failed:', error);
      throw normalizePrismaError(error);
    }
  },

  async list(
    domainId: string,
    adminId: string,
    query: {
      offset?: number | string;
      limit?: number | string;
      status?: JournalEntryStatus;
      entryType?: JournalEntryType;
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
    try {
      const { offset, limit } = normalizePagination(query);
      const [totalCount, data] = await journalEntryRepository.list(
        domainId,
        adminId,
        limit,
        offset,
        query,
      );
      return { data, pagination: { totalCount, offset, limit } };
    } catch (error) {
      throw normalizePrismaError(error);
    }
  },

  async getById(domainId: string, adminId: string, id: string) {
    try {
      const record = await journalEntryRepository.findById(
        id,
        domainId,
        adminId,
      );
      if (!record) throw new Error('Journal entry not found');
      return record;
    } catch (error) {
      throw normalizePrismaError(error);
    }
  },

  async update(
    domainId: string,
    adminId: string,
    id: string,
    data: Partial<JournalEntryInput>,
  ) {
    try {
      const existing = await JournalEntryService.getById(domainId, adminId, id);
      if (existing.status !== 'DRAFT') {
        throw new Error('Posted journal entry cannot be updated');
      }

      const merged: JournalEntryInput = {
        voucherNo: data.voucherNo ?? existing.voucherNo,
        voucherType: data.voucherType ?? existing.voucherType,
        transactionDate: data.transactionDate ?? existing.transactionDate,
        postingDate: data.postingDate ?? existing.postingDate,
        referenceNo:
          data.referenceNo === undefined
            ? existing.referenceNo
            : data.referenceNo,
        externalReferenceNo:
          data.externalReferenceNo === undefined
            ? existing.externalReferenceNo
            : data.externalReferenceNo,
        narration:
          data.narration === undefined ? existing.narration : data.narration,
        totalDebit:
          data.totalDebit === undefined
            ? Number(existing.totalDebit)
            : data.totalDebit,
        totalCredit:
          data.totalCredit === undefined
            ? Number(existing.totalCredit)
            : data.totalCredit,
        currencyId: data.currencyId ?? existing.currencyId,
        exchangeRate:
          data.exchangeRate === undefined
            ? Number(existing.exchangeRate)
            : data.exchangeRate,
        entryType: data.entryType ?? existing.entryType,
        sourceDocumentId:
          data.sourceDocumentId === undefined
            ? existing.sourceDocumentId
            : data.sourceDocumentId,
        sourceDocumentType:
          data.sourceDocumentType === undefined
            ? existing.sourceDocumentType
            : data.sourceDocumentType,
        isAdjustment: data.isAdjustment ?? existing.isAdjustment,
        isYearEndClosing: data.isYearEndClosing ?? existing.isYearEndClosing,
        fiscalYearId: data.fiscalYearId ?? existing.fiscalYearId,
        accountingPeriodId:
          data.accountingPeriodId ?? existing.accountingPeriodId,
        vendorId:
          data.vendorId === undefined ? existing.vendorId : data.vendorId,
        customerId:
          data.customerId === undefined ? existing.customerId : data.customerId,
        costCenterId: data.costCenterId ?? existing.costCenterId,
        projectId: data.projectId ?? existing.projectId,
      };

      if (
        await journalEntryRepository.findDuplicateVoucher(
          merged.voucherNo,
          domainId,
          merged.fiscalYearId,
          id,
        )
      ) {
        throw new Error('duplicate voucher number');
      }
      await validateContext(domainId, adminId, merged);

      const updated = await journalEntryRepository.updateDraft(
        id,
        domainId,
        adminId,
        data,
      );
      if (!updated) throw new Error('Posted journal entry cannot be updated');
      return updated;
    } catch (error) {
      throw normalizePrismaError(error);
    }
  },

  async delete(domainId: string, adminId: string, id: string) {
    try {
      const existing = await JournalEntryService.getById(domainId, adminId, id);
      if (existing.status !== 'DRAFT') {
        throw new Error('Posted journal entry cannot be deleted');
      }
      if (
        !(await journalEntryRepository.softDeleteDraft(id, domainId, adminId))
      ) {
        throw new Error('Posted journal entry cannot be deleted');
      }
    } catch (error) {
      throw normalizePrismaError(error);
    }
  },

  async post(domainId: string, adminId: string, id: string) {
    try {
      return await journalEntryRepository.postDraft(id, domainId, adminId);
    } catch (error) {
      throw normalizePrismaError(error);
    }
  },

  async reverse(domainId: string, adminId: string, id: string) {
    try {
      return await journalEntryRepository.reversePosted(id, domainId, adminId);
    } catch (error) {
      throw normalizePrismaError(error);
    }
  },
};
