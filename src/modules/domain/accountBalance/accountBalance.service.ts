import { Messages } from '../../../constants/index.js';
import { accountBalanceRepository } from '../../../repositories/index.js';
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

export const AccountBalanceService = {
  async findAll(domainId: string, adminId: string, query: ListQuery) {
    const { offset, limit } = normalizePagination(query);
    const [totalCount, data] = await accountBalanceRepository.listByDomain(
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
    const balance = await accountBalanceRepository.findByIdAndDomain(
      id,
      domainId,
      adminId,
    );
    if (!balance) throw new Error(Messages.ACCOUNT_BALANCE.NOT_FOUND);
    return balance;
  },
};
