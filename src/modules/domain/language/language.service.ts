import { Messages } from '../../../constants/index.js';
import { AdminLanguageRepository } from '../../../repositories/index.js';
import type { PaginationQuery } from '../../../utils/pagination.js';
import { normalizePagination } from '../../../utils/pagination.js';

export const LanguageService = {
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

    const [totalCount, languages] = await AdminLanguageRepository.listActive(
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
      languages,
      pagination: {
        totalCount,
        offset,
        limit,
      },
    };
  },

  async getLanguage(id: string) {
    const language = await AdminLanguageRepository.findById(id, {
      select: {
        id: true,
        language: {
          select: {
            id: true,
            name: true,
            code: true,
            flag: true,
            dir: true,
          },
        },
        isDefault: true,
        isEnabled: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!language) {
      throw new Error(Messages.LANGUAGE.NOT_FOUND);
    }
    return language;
  },
};
