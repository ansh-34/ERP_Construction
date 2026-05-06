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

  async listLanguages(query: PaginationQuery) {
    const { offset, limit } = normalizePagination(query);

    const [totalCount, languages] = await LanguageRepository.listActive(
      limit,
      offset,
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
};
