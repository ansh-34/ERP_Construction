import type { JournalEntryLineStatus } from '../../../infra/database/prisma/generated/prisma/client/enums.js';
import { journalEntryLineRepository } from '../../../repositories/index.js';
import { normalizePagination } from '../../../utils/pagination.js';
import { normalizePrismaError } from '../../../utils/prismaError.js';

type JournalEntryLineInput = {
  journalEntryId: string;
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
  status?: JournalEntryLineStatus;
  vendorId?: string | null;
  customerId?: string | null;
};

async function validateContext(
  domainId: string,
  adminId: string,
  data: JournalEntryLineInput,
) {
  const [journalEntry, account, project, costCenter, vendor, customer] =
    await Promise.all([
      journalEntryLineRepository.findJournalEntry(
        data.journalEntryId,
        domainId,
        adminId,
      ),
      journalEntryLineRepository.findAccount(data.accountId, domainId, adminId),
      journalEntryLineRepository.findProject(data.projectId, domainId, adminId),
      journalEntryLineRepository.findCostCenter(
        data.costCenterId,
        domainId,
        adminId,
      ),
      data.vendorId
        ? journalEntryLineRepository.findVendor(data.vendorId, domainId)
        : Promise.resolve(null),
      data.customerId
        ? journalEntryLineRepository.findCustomer(
            data.customerId,
            domainId,
            adminId,
          )
        : Promise.resolve(null),
    ]);

  if (!journalEntry) throw new Error('Journal entry not found');
  if (journalEntry.status !== 'DRAFT') {
    throw new Error('Journal entry lines can only be changed while DRAFT');
  }
  if (!account) throw new Error('Posting account not found');
  if (!project) throw new Error('Project not found');
  if (!costCenter) throw new Error('Cost center not found');
  if (data.vendorId && !vendor) throw new Error('Vendor not found');
  if (data.customerId && !customer) throw new Error('Customer not found');
}

function validateAmounts(data: JournalEntryLineInput) {
  const debit = data.debitAmount ?? 0;
  const credit = data.creditAmount ?? 0;
  if ((debit > 0 && credit > 0) || (debit === 0 && credit === 0)) {
    throw new Error(
      'Exactly one of debitAmount or creditAmount must be positive',
    );
  }
  if ((data.reconciledAmount ?? 0) > Math.max(debit, credit)) {
    throw new Error('Reconciled amount cannot exceed the line amount');
  }
}

export const JournalEntryLineService = {
  async create(domainId: string, adminId: string, data: JournalEntryLineInput) {
    try {
      await validateContext(domainId, adminId, data);
      validateAmounts(data);
      if (
        await journalEntryLineRepository.findDuplicateLine(
          data.journalEntryId,
          data.lineNo,
          domainId,
          adminId,
        )
      ) {
        throw new Error('duplicate journal entry line number');
      }

      return await journalEntryLineRepository.create({
        ...data,
        debitAmount: data.debitAmount ?? 0,
        creditAmount: data.creditAmount ?? 0,
        transactionCurrencyDebit: data.transactionCurrencyDebit ?? 0,
        transactionCurrencyCredit: data.transactionCurrencyCredit ?? 0,
        exchangeRate: data.exchangeRate ?? 1,
        reconciledAmount: data.reconciledAmount ?? 0,
        isReconciled: data.isReconciled ?? false,
        status: data.status ?? 'ACTIVE',
        domainId,
        adminId,
      });
    } catch (error) {
      throw normalizePrismaError(error);
    }
  },

  async list(
    domainId: string,
    adminId: string,
    query: {
      offset?: number | string;
      limit?: number | string;
      journalEntryId?: string;
      accountId?: string;
      projectId?: string;
      costCenterId?: string;
      vendorId?: string;
      customerId?: string;
      status?: JournalEntryLineStatus;
      isReconciled?: boolean;
      searchKey?: string;
    },
  ) {
    try {
      const { offset, limit } = normalizePagination(query);
      const [totalCount, data] = await journalEntryLineRepository.list(
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
      const record = await journalEntryLineRepository.findById(
        id,
        domainId,
        adminId,
      );
      if (!record) throw new Error('Journal entry line not found');
      return record;
    } catch (error) {
      throw normalizePrismaError(error);
    }
  },

  async update(
    domainId: string,
    adminId: string,
    id: string,
    data: Partial<JournalEntryLineInput>,
  ) {
    try {
      const existing = await this.getById(domainId, adminId, id);
      const merged: JournalEntryLineInput = {
        journalEntryId: data.journalEntryId ?? existing.journalEntryId,
        lineNo: data.lineNo ?? existing.lineNo,
        accountId: data.accountId ?? existing.accountId,
        debitAmount:
          data.debitAmount === undefined
            ? Number(existing.debitAmount)
            : data.debitAmount,
        creditAmount:
          data.creditAmount === undefined
            ? Number(existing.creditAmount)
            : data.creditAmount,
        transactionCurrencyDebit:
          data.transactionCurrencyDebit === undefined
            ? Number(existing.transactionCurrencyDebit)
            : data.transactionCurrencyDebit,
        transactionCurrencyCredit:
          data.transactionCurrencyCredit === undefined
            ? Number(existing.transactionCurrencyCredit)
            : data.transactionCurrencyCredit,
        exchangeRate:
          data.exchangeRate === undefined
            ? Number(existing.exchangeRate)
            : data.exchangeRate,
        description:
          data.description === undefined
            ? existing.description
            : data.description,
        referenceNo:
          data.referenceNo === undefined
            ? existing.referenceNo
            : data.referenceNo,
        costCenterId: data.costCenterId ?? existing.costCenterId,
        projectId: data.projectId ?? existing.projectId,
        reconciledAmount:
          data.reconciledAmount === undefined
            ? Number(existing.reconciledAmount)
            : data.reconciledAmount,
        isReconciled: data.isReconciled ?? existing.isReconciled,
        status: data.status ?? existing.status,
        vendorId:
          data.vendorId === undefined ? existing.vendorId : data.vendorId,
        customerId:
          data.customerId === undefined ? existing.customerId : data.customerId,
      };

      await validateContext(domainId, adminId, merged);
      validateAmounts(merged);
      if (
        await journalEntryLineRepository.findDuplicateLine(
          merged.journalEntryId,
          merged.lineNo,
          domainId,
          adminId,
          id,
        )
      ) {
        throw new Error('duplicate journal entry line number');
      }

      const updated = await journalEntryLineRepository.update(
        id,
        domainId,
        adminId,
        data,
      );
      if (!updated) {
        throw new Error('Journal entry line can only be updated while DRAFT');
      }
      return updated;
    } catch (error) {
      throw normalizePrismaError(error);
    }
  },

  async delete(domainId: string, adminId: string, id: string) {
    try {
      await this.getById(domainId, adminId, id);
      if (!(await journalEntryLineRepository.delete(id, domainId, adminId))) {
        throw new Error('Journal entry line can only be deleted while DRAFT');
      }
    } catch (error) {
      throw normalizePrismaError(error);
    }
  },
};
