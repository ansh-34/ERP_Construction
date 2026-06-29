import {
  accountingPeriodRepository,
  fiscalYearRepository,
} from '../../../repositories/index.js';
import { normalizePagination } from '../../../utils/pagination.js';
import { normalizePrismaError } from '../../../utils/prismaError.js';

type FiscalYearInput = {
  name: string;
  startDate: Date;
  endDate: Date;
};

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

      return await fiscalYearRepository.create({
        name: dto.name,
        startDate: dto.startDate,
        endDate: dto.endDate,
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
