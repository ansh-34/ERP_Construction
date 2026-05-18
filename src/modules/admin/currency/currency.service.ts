import { Messages } from '../../../constants/index.js';
import { AdminCurrencyRepository } from '../../../repositories/index.js';
import type { PaginationQuery } from '../../../utils/pagination.js';
import { normalizePagination } from '../../../utils/pagination.js';

type AdminCurrencyListItem = {
  id: string;
  currency: {
    id: string;
    name: Record<string, string>;
    code: string;
    symbol: string;
    flag: string;
    status: 'active' | 'inactive';
  };
  isDefault: boolean;
  isEnabled: boolean;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
};

type AdminCurrencyDetails = {
  id: string;
  currency: {
    id: string;
    name: Record<string, string>;
    code: string;
    symbol: string;
    flag: string;
    status: 'active' | 'inactive';
  };
  isDefault: boolean;
  isEnabled: boolean;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
};

function normalizeCurrencyName(name: Record<string, string>, langCode: string) {
  return name[langCode] || name.en || '';
}

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

    const normalizedCurrencies = (currencies as AdminCurrencyListItem[]).map(
      (item) => ({
        adminRelationalId: item.id,
        name: normalizeCurrencyName(item.currency.name, langCode),
        code: item.currency.code,
        symbol: item.currency.symbol,
        flag: item.currency.flag,
        status: item.status,
        isDefault: item.isDefault,
        isEnabled: item.isEnabled,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }),
    );

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
    const currency = (await AdminCurrencyRepository.findFirst(
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
    )) as AdminCurrencyDetails | null;
    if (!currency) {
      throw new Error(Messages.CURRENCY.NOT_FOUND);
    }

    return {
      adminRelationalId: currency.id,
      name: normalizeCurrencyName(currency.currency.name, langCode || 'en'),
      code: currency.currency.code,
      symbol: currency.currency.symbol,
      flag: currency.currency.flag,
      status: currency.status,
      isDefault: currency.isDefault,
      isEnabled: currency.isEnabled,
      createdAt: currency.createdAt,
      updatedAt: currency.updatedAt,
    };
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
