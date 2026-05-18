import { Messages } from '../../../constants/index.js';
import { AdminLanguageRepository } from '../../../repositories/index.js';
import type { PaginationQuery } from '../../../utils/pagination.js';
import { normalizePagination } from '../../../utils/pagination.js';

type DomainLanguageListItem = {
  id: string;
  language: {
    id: string;
    name: string;
    code: string;
    flag: string;
    dir: 'ltr' | 'rtl';
  };
  isDefault: boolean;
  isEnabled: boolean;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
};

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
      languages: (languages as DomainLanguageListItem[]).map((item) => ({
        domainRelationalId: item.id,
        name: item.language.name,
        code: item.language.code,
        flag: item.language.flag,
        dir: item.language.dir,
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
    return {
      domainRelationalId: language.id,
      name: language.language.name,
      code: language.language.code,
      flag: language.language.flag,
      dir: language.language.dir,
      isDefault: language.isDefault,
      isEnabled: language.isEnabled,
      status: language.status,
      createdAt: language.createdAt,
      updatedAt: language.updatedAt,
    };
  },
};
