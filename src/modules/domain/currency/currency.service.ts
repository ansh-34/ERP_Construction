import { Messages } from '../../../constants/index.js';
import { AdminCurrencyRepository } from '../../../repositories/index.js';
import type { PaginationQuery } from '../../../utils/pagination.js';
import { normalizePagination } from '../../../utils/pagination.js';

type DomainCurrencyListItem = {
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

type DomainCurrencyDetails = DomainCurrencyListItem;

function normalizeCurrencyName(name: Record<string, string>) {
  return name.en || '';
}

export const CurrencyService = {
  async listLanguages(
    query: PaginationQuery & {
      searchKey?: string;
      isDefault?: boolean;
    },
    adminId: string,
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
          status: 'ACTIVE',
          isEnabled: true,
          ...(Object.prototype.hasOwnProperty.call(query, 'isDefault') && {
            isDefault: query.isDefault,
          }),
          adminId,
        },
      },
    );

    return {
      currencies: (currencies as DomainCurrencyListItem[]).map((item) => ({
        domainRelationalId: item.id,
        name: normalizeCurrencyName(item.currency.name),
        code: item.currency.code,
        symbol: item.currency.symbol,
        flag: item.currency.flag,
        isDefault: item.isDefault,
        isEnabled: item.isEnabled,
        status: item.status,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
      pagination: {
        totalCount,
        offset,
        limit,
      },
    };
  },

  async getCurrency(id: string) {
    const currency = (await AdminCurrencyRepository.findById(id, {
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
    })) as DomainCurrencyDetails | null;
    if (!currency) {
      throw new Error(Messages.CURRENCY.NOT_FOUND);
    }
    return {
      domainRelationalId: currency.id,
      name: normalizeCurrencyName(currency.currency.name),
      code: currency.currency.code,
      symbol: currency.currency.symbol,
      flag: currency.currency.flag,
      isDefault: currency.isDefault,
      isEnabled: currency.isEnabled,
      status: currency.status,
      createdAt: currency.createdAt,
      updatedAt: currency.updatedAt,
    };
  },
};
