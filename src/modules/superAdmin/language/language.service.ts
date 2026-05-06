import { Messages } from '../../../constants/index.js';
import { LanguageRepository } from '../../../repositories/index.js';
import type { PaginationQuery } from '../../../utils/pagination.js';
import { normalizePagination } from '../../../utils/pagination.js';

export const LanguageService = {
  async createLanguage(data: { name: any; code: string }) {
    const { name, code } = data;

    if (!name || !code) {
      throw new Error(Messages.LANGUAGE.NAME_CODE_REQUIRED);
    }

    const existing = await LanguageRepository.findActiveByCode(code);

    if (existing) {
      throw new Error(Messages.LANGUAGE.CODE_ALREADY_EXISTS);
    }

    return LanguageRepository.create({ name, code });
  },

  async listLanguages(
    query: PaginationQuery & { searchKey?: string; status?: string },
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

  async updateLanguage(id: string, data: { name?: any; code?: string }) {
    const language = await LanguageRepository.findById(id);
    if (!language) {
      throw new Error(Messages.LANGUAGE.NOT_FOUND);
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

    return LanguageRepository.softDelete(id);
  },
};
