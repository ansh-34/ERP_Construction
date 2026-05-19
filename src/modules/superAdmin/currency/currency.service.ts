import { Messages } from '../../../constants/index.js';
import { CurrencyRepository } from '../../../repositories/index.js';
import type { PaginationQuery } from '../../../utils/pagination.js';
import { normalizePagination } from '../../../utils/pagination.js';
import { CreateCurrencyData } from './currency.validator.js';

export const CurrencyService = {
  async createCurrency(data: CreateCurrencyData) {
    const { name, symbol, flag } = data;

    const incomingLanguageCodes: string[] = Object.keys(name);
    if (!incomingLanguageCodes.includes('en')) {
      throw new Error(Messages.MODULE.NAME_EN_CODE_REQUIRED);
    }

    const code = name?.en?.toString().toUpperCase().replace(/\s+/g, '_');
    const searchText = Object.values(name).join(' ').toLowerCase();

    if (!name || !code) {
      throw new Error(Messages.CURRENCY.NAME_CODE_REQUIRED);
    }

    const existing = await CurrencyRepository.findActiveByCode(code);

    if (existing) {
      throw new Error(Messages.CURRENCY.CODE_ALREADY_EXISTS);
    }

    return CurrencyRepository.create({ name, code, symbol, searchText, flag });
  },

  async listCurrencies(
    query: PaginationQuery & {
      searchKey?: string;
      status?: 'ACTIVE' | 'INACTIVE';
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
          searchKey: query.searchKey || '',
          ...(query.status && { status: query.status }),
        },
      },
    );

    const normalizeCurrencies = currencies.map((currency: any) => ({
      ...currency,
      name: currency.name[langCode] || currency.name.en || '',
    }));

    return {
      currencies: normalizeCurrencies,
      pagination: {
        totalCount,
        offset,
        limit,
      },
    };
  },

  async getCurrency(id: string, langCode: string | undefined) {
    const currency: any = await CurrencyRepository.findById(id);
    if (!currency) {
      throw new Error(Messages.CURRENCY.NOT_FOUND);
    }

    let normalizedCurrency = currency;

    if (langCode) {
      normalizedCurrency = {
        ...currency,
        name: currency.name?.[langCode] || currency.name?.en || '',
      };
    }

    return normalizedCurrency;
  },

  async updateCurrency(
    id: string,
    data: {
      name?: any;
      symbol?: string;
      flag?: string;
      status?: 'active' | 'inactive';
    },
  ) {
    const { name, status, symbol, flag } = data;
    let code: string | null = null;
    let searchText: string | null = null;

    const currency = await CurrencyRepository.findById(id);
    if (!currency) {
      throw new Error(Messages.CURRENCY.NOT_FOUND);
    }

    if (name) {
      const incomingLanguageCodes: string[] = Object.keys(name);
      if (!incomingLanguageCodes.includes('en')) {
        throw new Error(Messages.MODULE.NAME_EN_CODE_REQUIRED);
      }

      code = name?.en?.toString().toUpperCase().replace(/\s+/g, '_');
      searchText = Object.values(name).join(' ').toLowerCase();

      if (code && code !== currency.code) {
        const duplicate = await CurrencyRepository.findDuplicateCode(code, id);
        if (duplicate) {
          throw new Error(Messages.MODULE.CODE_ALREADY_EXISTS);
        }
      }
    }

    return CurrencyRepository.update(id, {
      ...(name && { name }),
      ...(code && { code }),
      ...(symbol && { symbol }),
      ...(flag && { flag }),
      ...(code && { code }),
      ...(status && { status }),
      ...(searchText && { searchText }),
    });
  },

  async deleteCurrency(id: string) {
    const currency = await CurrencyRepository.findById(id);

    if (!currency) {
      throw new Error(Messages.CURRENCY.NOT_FOUND);
    }

    return CurrencyRepository.softDelete(id);
  },
};
