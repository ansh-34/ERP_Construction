import { Messages } from '../../../constants/index.js';
import { LanguageRepository } from '../../../repositories/index.js';
import type { PaginationQuery } from '../../../utils/pagination.js';
import { normalizePagination } from '../../../utils/pagination.js';

export const LanguageService = {
  async createLanguage(data: {
    name: any;
    code: string;
    dir: 'ltr' | 'rtl';
    flag: string;
  }) {
    const { name, code, dir, flag } = data;

    if (!name || !code) {
      throw new Error(Messages.LANGUAGE.NAME_CODE_REQUIRED);
    }

    const existing = await LanguageRepository.findActiveByCode(code);

    if (existing) {
      throw new Error(Messages.LANGUAGE.CODE_ALREADY_EXISTS);
    }

    return LanguageRepository.create({ name, code, dir, flag });
  },

  async listLanguages(
    query: PaginationQuery & {
      searchKey?: string;
      status?: 'ACTIVE' | 'INACTIVE';
      dir?: 'ltr' | 'rtl';
      code?: string;
    },
  ) {
    const { offset, limit } = normalizePagination({
      limit: query.limit,
      offset: query.offset,
    });

    const [totalCount, languages] = await LanguageRepository.listActive(
      limit,
      offset,
      {
        filters: {
          searchKey: query.searchKey || '',
          ...(query.status && { status: query.status }),
          ...(query.code && { code: query.code }),
          ...(query.dir && { dir: query.dir }),
        },
      },
    );

    return {
      languages,
      pagination: {
        totalCount,
        offset,
        limit,
      },
    };
  },

  async getLanguage(id: string) {
    const language = await LanguageRepository.findById(id);
    if (!language) {
      throw new Error(Messages.LANGUAGE.NOT_FOUND);
    }
    return language;
  },

  async updateLanguage(
    id: string,
    data: { name?: any; code?: string; dir?: 'ltr' | 'rtl'; flag?: string },
  ) {
    const language = await LanguageRepository.findById(id);
    if (!language) {
      throw new Error(Messages.LANGUAGE.NOT_FOUND);
    }

    if (language.code === 'en') {
      throw new Error(Messages.LANGUAGE.CANNOT_UPDATE_ENGLISH_LANGUAGE);
    }

    if (data.code && data.code !== language.code) {
      const existing = await LanguageRepository.findActiveByCode(data.code);
      if (existing) {
        throw new Error(Messages.LANGUAGE.CODE_ALREADY_EXISTS);
      }
    }
    if (data.name && data.name !== language.name) {
      const existing = await LanguageRepository.findByName(data.name);
      if (existing) {
        throw new Error(Messages.LANGUAGE.NAME_ALREADY_EXISTS);
      }
    }

    return LanguageRepository.update(id, data);
  },

  async deleteLanguage(id: string) {
    const language = await LanguageRepository.findById(id);

    if (!language) {
      throw new Error(Messages.LANGUAGE.NOT_FOUND);
    }

    if (language.code === 'en') {
      throw new Error(Messages.LANGUAGE.CANNOT_DELETE_ENGLISH_LANGUAGE);
    }

    return LanguageRepository.softDelete(id);
  },
};
