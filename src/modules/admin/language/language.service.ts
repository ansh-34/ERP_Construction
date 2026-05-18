import { Messages } from '../../../constants/index.js';
import { AdminLanguageRepository } from '../../../repositories/index.js';
import type { PaginationQuery } from '../../../utils/pagination.js';
import { normalizePagination } from '../../../utils/pagination.js';

type AdminLanguageListItem = {
  id: string;
  language: {
    id: string;
    name: string;
    code: string;
    flag: string;
    dir: 'ltr' | 'rtl';
  };
  createdAt: Date;
  updatedAt: Date;
};

export const LanguageService = {
  async listLanguages(
    query: PaginationQuery & {
      searchKey?: string;
      isDefault?: boolean;
      isEnabled?: boolean;
      status?: 'active' | 'inactive';
    },
    adminId: string,
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
          ...(query.status && { status: query.status }),
          ...(Object.prototype.hasOwnProperty.call(query, 'isDefault') && {
            isDefault: query.isDefault,
          }),
          isEnabled: true,
          adminId,
        },
      },
    );

return {
      languages: (languages as AdminLanguageListItem[]).map((item) => ({
        adminRelationalId: item.id,
        name: item.language.name,
        code: item.language.code,
        flag: item.language.flag,
        dir: item.language.dir,
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
  async getLanguage(id: string, adminId: string) {
    const language = await AdminLanguageRepository.findFirst(
      {
        id,
        adminId,
      },
      {
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
      },
    );
    if (!language) {
      throw new Error(Messages.LANGUAGE.NOT_FOUND);
    }
    return {
      adminRelationalId: language.id,
      name: language.language.name,
      code: language.language.code,
      flag: language.language.flag,
      dir: language.language.dir,
      createdAt: language.createdAt,
      updatedAt: language.updatedAt,
    };
  },
  async updateLanguage(
    id: string,
    adminId: string,
    data: {
      status?: 'active' | 'inactive';
      isEnabled?: boolean;
      isDefault?: boolean;
    },
  ) {
    const language = await AdminLanguageRepository.findFirst({
      id,
      adminId,
    });
    if (!language) {
      throw new Error(Messages.LANGUAGE.NOT_FOUND);
    }

    return AdminLanguageRepository.update(id, data);
  },
};
