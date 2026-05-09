import { LanguageRepository } from '../../../repositories/index.js';
import type { PaginationQuery } from '../../../utils/pagination.js';
import { normalizePagination } from '../../../utils/pagination.js';

export const LanguageService = {
  async listLanguages(
    query: PaginationQuery & {
      searchKey?: string;
      status?: string;
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
        select: {
          name: true,
          code: true,
          status: true,
          dir: true,
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
};
