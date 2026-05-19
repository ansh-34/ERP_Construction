import { Messages } from '../../../constants/index.js';
import { LanguageRepository } from '../../../repositories/index.js';
import type { PaginationQuery } from '../../../utils/pagination.js';
import { normalizePagination } from '../../../utils/pagination.js';

type UserLanguageListItem = {
  id: string;
  name: string;
  code: string;
  flag: string;
  dir: 'ltr' | 'rtl';
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
};

export const UserLanguageService = {
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
        select: {
          id: true,
          name: true,
          code: true,
          flag: true,
          dir: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    );

    return {
      languages: (languages as UserLanguageListItem[]).map((language) => ({
        userRelationalId: language.id,
        name: language.name,
        code: language.code,
        flag: language.flag,
        dir: language.dir,
        status: language.status,
        createdAt: language.createdAt,
        updatedAt: language.updatedAt,
      })),
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

    return {
      userRelationalId: language.id,
      name: language.name,
      code: language.code,
      flag: language.flag,
      dir: language.dir,
      status: language.status,
      createdAt: language.createdAt,
      updatedAt: language.updatedAt,
    };
  },
};
