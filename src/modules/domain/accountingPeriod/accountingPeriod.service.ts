import {
  accountingPeriodRepository,
  fiscalYearRepository,
} from '../../../repositories/index.js';
import { normalizePagination } from '../../../utils/pagination.js';
import { normalizePrismaError } from '../../../utils/prismaError.js';

type AccountingPeriodInput = {
  fiscalYearId: string;
  name: string;
  periodNo: number;
  startDate: Date;
  endDate: Date;
};

async function getOpenFiscalYear(domainId: string, fiscalYearId: string) {
  const fiscalYear = await fiscalYearRepository.findById(
    fiscalYearId,
    domainId,
  );

  if (!fiscalYear) throw new Error('Fiscal year not found');
  if (fiscalYear.isClosed) {
    throw new Error('Accounting period cannot use a closed fiscal year');
  }

  return fiscalYear;
}

function assertDatesInsideFiscalYear(
  startDate: Date,
  endDate: Date,
  fiscalYear: { startDate: Date; endDate: Date },
) {
  if (startDate >= endDate) {
    throw new Error('endDate must be after startDate');
  }

  if (startDate < fiscalYear.startDate || endDate > fiscalYear.endDate) {
    throw new Error('Accounting period dates must be inside the fiscal year');
  }
}

async function assertUniqueAndNonOverlapping(
  domainId: string,
  data: AccountingPeriodInput,
  excludeId?: string,
) {
  const [sameName, sameNumber, overlap] = await Promise.all([
    accountingPeriodRepository.findByName(
      data.fiscalYearId,
      data.name,
      domainId,
      excludeId,
    ),
    accountingPeriodRepository.findByPeriodNo(
      data.fiscalYearId,
      data.periodNo,
      domainId,
      excludeId,
    ),
    accountingPeriodRepository.findOverlapping(
      data.fiscalYearId,
      domainId,
      data.startDate,
      data.endDate,
      excludeId,
    ),
  ]);

  if (sameName) throw new Error('Accounting period name already exists');
  if (sameNumber) throw new Error('Accounting period number already exists');
  if (overlap) {
    throw new Error('Accounting period dates overlap an existing period');
  }
}

export const AccountingPeriodService = {
  async create(domainId: string, adminId: string, dto: AccountingPeriodInput) {
    try {
      const fiscalYear = await getOpenFiscalYear(domainId, dto.fiscalYearId);
      assertDatesInsideFiscalYear(dto.startDate, dto.endDate, fiscalYear);
      await assertUniqueAndNonOverlapping(domainId, dto);

      return await accountingPeriodRepository.create({
        ...dto,
        domainId,
        adminId,
      });
    } catch (error) {
      throw normalizePrismaError(error);
    }
  },

  async list(
    domainId: string,
    query: {
      offset?: number | string;
      limit?: number | string;
      fiscalYearId?: string;
      isClosed?: boolean;
      searchKey?: string;
    },
  ) {
    try {
      const { offset, limit } = normalizePagination(query);
      const [totalCount, data] = await accountingPeriodRepository.list(
        domainId,
        limit,
        offset,
        {
          fiscalYearId: query.fiscalYearId,
          isClosed: query.isClosed,
          searchKey: query.searchKey,
        },
      );

      return { data, pagination: { totalCount, offset, limit } };
    } catch (error) {
      throw normalizePrismaError(error);
    }
  },

  async getById(domainId: string, id: string) {
    try {
      const period = await accountingPeriodRepository.findById(id, domainId);
      if (!period) throw new Error('Accounting period not found');
      return period;
    } catch (error) {
      throw normalizePrismaError(error);
    }
  },

  async update(
    domainId: string,
    id: string,
    dto: Partial<Omit<AccountingPeriodInput, 'fiscalYearId'>>,
  ) {
    try {
      const existing = await AccountingPeriodService.getById(domainId, id);
      if (existing.isClosed) {
        throw new Error('Closed accounting period cannot be updated');
      }

      const fiscalYear = await getOpenFiscalYear(
        domainId,
        existing.fiscalYearId,
      );
      const data: AccountingPeriodInput = {
        fiscalYearId: existing.fiscalYearId,
        name: dto.name ?? existing.name,
        periodNo: dto.periodNo ?? existing.periodNo,
        startDate: dto.startDate ?? existing.startDate,
        endDate: dto.endDate ?? existing.endDate,
      };

      assertDatesInsideFiscalYear(data.startDate, data.endDate, fiscalYear);
      await assertUniqueAndNonOverlapping(domainId, data, id);

      const updated = await accountingPeriodRepository.updateOpen(
        id,
        domainId,
        {
          ...(dto.name !== undefined && { name: data.name }),
          ...(dto.periodNo !== undefined && { periodNo: data.periodNo }),
          ...(dto.startDate !== undefined && { startDate: data.startDate }),
          ...(dto.endDate !== undefined && { endDate: data.endDate }),
        },
      );

      if (!updated) {
        throw new Error('Closed accounting period cannot be updated');
      }
      return updated;
    } catch (error) {
      throw normalizePrismaError(error);
    }
  },

  async close(
    domainId: string,
    id: string,
    actor: { adminId?: string; userId?: string },
  ) {
    try {
      if (
        (!actor.adminId && !actor.userId) ||
        (actor.adminId && actor.userId)
      ) {
        throw new Error('invalid closing actor');
      }

      const existing = await AccountingPeriodService.getById(domainId, id);
      if (existing.isClosed) {
        throw new Error('Accounting period is already closed');
      }

      await getOpenFiscalYear(domainId, existing.fiscalYearId);
      const closed = await accountingPeriodRepository.close(
        id,
        domainId,
        actor,
      );

      if (!closed) throw new Error('Accounting period is already closed');
      return closed;
    } catch (error) {
      throw normalizePrismaError(error);
    }
  },
};
