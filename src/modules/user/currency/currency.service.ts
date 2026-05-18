import { Messages } from '../../../constants/index.js';
import { CurrencyRepository } from '../../../repositories/index.js';
import type { PaginationQuery } from '../../../utils/pagination.js';
import { normalizePagination } from '../../../utils/pagination.js';

type UserCurrencyListItem = {
  id: string;
  name: Record<string, string>;
  code: string;
  symbol: string;
  flag: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
};

const normalizeCurrencyName = (
  name: Record<string, string>,
  langCode: string,
) => name[langCode] || name.en || '';

const mapUserCurrency = (currency: UserCurrencyListItem, langCode: string) => ({
  userRelationalId: currency.id,
  name: normalizeCurrencyName(currency.name, langCode),
  code: currency.code,
  symbol: currency.symbol,
  flag: currency.flag,
  status: currency.status,
  createdAt: currency.createdAt,
  updatedAt: currency.updatedAt,
});

export const UserCurrencyService = {
  async listCurrencies(
    query: PaginationQuery & {
      searchKey?: string;
      status?: string;
      code?: string;
    },
    langCode: string,
  ) {
    const { offset, limit } = normalizePagination({
      limit: query.limit,
      offset: query.offset,
    });

    const [totalCount, currencies] = await CurrencyRepository.listActive(
      limit,
      offset,
      {
        filters: {
          searchKey: query.searchKey || query.code || '',
          ...(query.status && { status: query.status }),
        },
        select: {
          id: true,
          name: true,
          code: true,
          symbol: true,
          flag: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    );

    return {
      currencies: (currencies as unknown as UserCurrencyListItem[]).map(
        (currency) => mapUserCurrency(currency, langCode),
      ),
      pagination: {
        totalCount,
        offset,
        limit,
      },
    };
  },

  async getCurrency(id: string, langCode: string) {
    const currency = (await CurrencyRepository.findById(
      id,
    )) as UserCurrencyListItem | null;

    if (!currency) {
      throw new Error(Messages.CURRENCY.NOT_FOUND);
    }

    return mapUserCurrency(currency, langCode);
  },
};
