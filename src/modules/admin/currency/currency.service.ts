import { Messages } from '../../../constants/index.js';
import { AdminCurrencyRepository } from '../../../repositories/index.js';
import type { PaginationQuery } from '../../../utils/pagination.js';
import { normalizePagination } from '../../../utils/pagination.js';

export const CurrencyService = {
  async listCurrencies(
    query: PaginationQuery & {
      searchKey?: string;
      status?: 'active' | 'inactive';
      isEnabled?: boolean;
      isDefault?: boolean;
    },
    adminId: string,
    langCode: string,
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
          ...(query.status && { status: query.status }),
          isEnabled: true,
          ...(Object.prototype.hasOwnProperty.call(query, 'isDefault') && {
            isDefault: query.isDefault,
          }),
          adminId,
        },
      },
    );

    const normalizedCurrencies = currencies.map((currency: any) => ({
      ...currency,
      currency:
        currency.currency.name[langCode] || currency.currency.name.en || '',
    }));

    return {
      currencies: normalizedCurrencies,
      pagination: {
        totalCount,
        offset,
        limit,
      },
    };
  },

  async getCurrency(id: string, adminId: string, langCode: string | undefined) {
    const currency = await AdminCurrencyRepository.findFirst(
      {
        adminId,
        id,
      },
      {
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
      },
    );
    if (!currency) {
      throw new Error(Messages.CURRENCY.NOT_FOUND);
    }

    let normalizedCurrency = currency;
    if (langCode) {
      normalizedCurrency = {
        ...currency,
        currency: {
          ...currency.currency,
          name:
            currency.currency.name[langCode] || currency.currency.name.en || '',
        },
      };
    }

    return normalizedCurrency;
  },

  async updateCurrency(
    id: string,
    adminId: string,
    data: {
      status?: 'active' | 'inactive';
      isEnabled?: boolean;
      isDefault?: boolean;
    },
  ) {
    const currency = await AdminCurrencyRepository.findFirst({
      adminId,
      id,
    });
    if (!currency) {
      throw new Error(Messages.CURRENCY.NOT_FOUND);
    }

    return await AdminCurrencyRepository.update(id, data);
  },
};
