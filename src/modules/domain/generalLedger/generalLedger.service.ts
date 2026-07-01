import { Messages } from '../../../constants/index.js';
import { generalLedgerEntryRepository } from '../../../repositories/index.js';
import { normalizePagination } from '../../../utils/pagination.js';

type ListQuery = {
  offset?: number | string;
  limit?: number | string;
  accountId?: string;
  fiscalYearId?: string;
  accountingPeriodId?: string;
  costCenterId?: string;
  projectId?: string;
  from?: string;
  to?: string;
};

export const GeneralLedgerService = {
  async findAll(domainId: string, adminId: string, query: ListQuery) {
    const { offset, limit } = normalizePagination(query);
    const [totalCount, data] = await generalLedgerEntryRepository.listByDomain(
      domainId,
      adminId,
      limit,
      offset,
      {
        accountId: query.accountId,
        fiscalYearId: query.fiscalYearId,
        accountingPeriodId: query.accountingPeriodId,
        costCenterId: query.costCenterId,
        projectId: query.projectId,
        from: query.from,
        to: query.to,
      },
    );
    return { data, pagination: { totalCount, offset, limit } };
  },

  async findOne(domainId: string, adminId: string, id: string) {
    const entry = await generalLedgerEntryRepository.findByIdAndDomain(
      id,
      domainId,
      adminId,
    );
    if (!entry) throw new Error(Messages.GENERAL_LEDGER.NOT_FOUND);
    return entry;
  },
};
