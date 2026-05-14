import { Messages } from '../../../constants/index.js';
import { AdminCurrencyRepository } from '../../../repositories/index.js';
import type { PaginationQuery } from '../../../utils/pagination.js';
import { normalizePagination } from '../../../utils/pagination.js';

export const CurrencyService = {
  async listLanguages(
    query: PaginationQuery & {
      searchKey?: string;
      isDefault?: boolean;
    },
  ) {
    const { offset, limit } = normalizePagination({
      limit: query.limit,
      offset: query.offset,
    });

    const [totalCount, currencies] = await AdminCurrencyRepository.listActive(
      limit,
      offset,
      {
        filters: {
          searchKey: query.searchKey || '',
          status: 'active',
          isEnabled: true,
          ...(Object.prototype.hasOwnProperty.call(query, 'isDefault') && {
            isDefault: query.isDefault,
          }),
        },
      },
    );

    return {
      currencies,
      pagination: {
        totalCount,
        offset,
        limit,
      },
    };
  },

  async getCurrency(id: string) {
    const currency = await AdminCurrencyRepository.findById(id, {
      select: {
        id: true,
        currency: {
          select: {
            id: true,
            name: true,
            code: true,
            symbol: true,
            flag: true,
            status: true,
          },
        },
        isDefault: true,
        isEnabled: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!currency) {
      throw new Error(Messages.CURRENCY.NOT_FOUND);
    }
    return currency;
  },
};
