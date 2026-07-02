import {
  accountingPeriodRepository,
  fiscalYearRepository,
} from '../../../repositories/index.js';
import { normalizePagination } from '../../../utils/pagination.js';
import { normalizePrismaError } from '../../../utils/prismaError.js';
import { transaction } from '../../../infra/database/prisma/transaction.js';

type AccountingPeriodInput = {
  name: string;
  periodNo: number;
  startDate: Date;
  endDate: Date;
};

type FiscalYearInput = {
  name: string;
  startDate: Date;
  endDate: Date;
  accountingPeriods?: AccountingPeriodInput[];
};

function validateAccountingPeriods(
  periods: AccountingPeriodInput[],
  fiscalYear: Pick<FiscalYearInput, 'startDate' | 'endDate'>,
) {
  const names = new Set<string>();
  const periodNumbers = new Set<number>();
  const sortedPeriods = [...periods].sort(
    (left, right) => left.startDate.getTime() - right.startDate.getTime(),
  );

  for (const period of sortedPeriods) {
    if (period.startDate >= period.endDate) {
      throw new Error('Accounting period endDate must be after startDate');
    }
    if (
      period.startDate < fiscalYear.startDate ||
      period.endDate > fiscalYear.endDate
    ) {
      throw new Error('Accounting period dates must be inside the fiscal year');
    }

    const normalizedName = period.name.toLocaleLowerCase();
    if (names.has(normalizedName)) {
      throw new Error('Accounting period name already exists in request');
    }
    if (periodNumbers.has(period.periodNo)) {
      throw new Error('Accounting period number already exists in request');
    }
    names.add(normalizedName);
    periodNumbers.add(period.periodNo);
  }

  for (let index = 1; index < sortedPeriods.length; index += 1) {
    if (sortedPeriods[index].startDate <= sortedPeriods[index - 1].endDate) {
      throw new Error('Accounting period dates overlap in request');
    }
  }
}

async function assertNameAvailable(
  name: string,
  domainId: string,
  excludeId?: string,
) {
  if (await fiscalYearRepository.findByName(name, domainId, excludeId)) {
    throw new Error('Fiscal year name already exists');
  }
}

async function assertNoOverlap(
  domainId: string,
  startDate: Date,
  endDate: Date,
  excludeId?: string,
) {
  if (
    await fiscalYearRepository.findOverlapping(
      domainId,
      startDate,
      endDate,
      excludeId,
    )
  ) {
    throw new Error('Fiscal year dates overlap an existing fiscal year');
  }
}

export const FiscalYearService = {
  async create(domainId: string, adminId: string, dto: FiscalYearInput) {
    try {
      await Promise.all([
        assertNameAvailable(dto.name, domainId),
        assertNoOverlap(domainId, dto.startDate, dto.endDate),
      ]);

      const accountingPeriods = dto.accountingPeriods ?? [];
      validateAccountingPeriods(accountingPeriods, dto);

      return await transaction(async (tx) => {
        const fiscalYear = await fiscalYearRepository.create(
          {
            name: dto.name,
            startDate: dto.startDate,
            endDate: dto.endDate,
            domainId,
            adminId,
          },
          { transaction: tx },
        );

        const createdPeriods = await Promise.all(
          accountingPeriods.map((period) =>
            accountingPeriodRepository.create(
              {
                ...period,
                fiscalYearId: fiscalYear.id,
                domainId,
                adminId,
              },
              { transaction: tx },
            ),
          ),
        );

        return { ...fiscalYear, accountingPeriods: createdPeriods };
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
      isClosed?: boolean;
      searchKey?: string;
    },
  ) {
    try {
      const { offset, limit } = normalizePagination(query);
      const [totalCount, data] = await fiscalYearRepository.list(
        domainId,
        limit,
        offset,
        {
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
      const fiscalYear = await fiscalYearRepository.findById(id, domainId);
      if (!fiscalYear) throw new Error('Fiscal year not found');
      return fiscalYear;
    } catch (error) {
      throw normalizePrismaError(error);
    }
  },

  async update(domainId: string, id: string, dto: Partial<FiscalYearInput>) {
    try {
      const existing = await FiscalYearService.getById(domainId, id);
      if (existing.isClosed) {
        throw new Error('Closed fiscal year cannot be updated');
      }

      const name = dto.name ?? existing.name;
      const startDate = dto.startDate ?? existing.startDate;
      const endDate = dto.endDate ?? existing.endDate;

      if (startDate >= endDate) {
        throw new Error('endDate must be after startDate');
      }

      await Promise.all([
        assertNameAvailable(name, domainId, id),
        assertNoOverlap(domainId, startDate, endDate, id),
      ]);

      if (
        (dto.startDate !== undefined || dto.endDate !== undefined) &&
        (await accountingPeriodRepository.countOutsideRange(
          id,
          domainId,
          startDate,
          endDate,
        ))
      ) {
        throw new Error(
          'Fiscal year dates cannot exclude existing accounting periods',
        );
      }

      const updated = await fiscalYearRepository.updateOpen(id, domainId, {
        ...(dto.name !== undefined && { name }),
        ...(dto.startDate !== undefined && { startDate }),
        ...(dto.endDate !== undefined && { endDate }),
      });

      if (!updated) throw new Error('Closed fiscal year cannot be updated');
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

      const existing = await FiscalYearService.getById(domainId, id);
      if (existing.isClosed) {
        throw new Error('Fiscal year is already closed');
      }

      if (await accountingPeriodRepository.countOpen(id, domainId)) {
        throw new Error(
          'Fiscal year cannot be closed while accounting periods are open',
        );
      }

      const closed = await fiscalYearRepository.close(id, domainId, actor);
      if (!closed) throw new Error('Fiscal year is already closed');
      return closed;
    } catch (error) {
      throw normalizePrismaError(error);
    }
  },
};
