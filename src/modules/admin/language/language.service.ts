import { Messages } from '../../../constants/index.js';
import { AdminLanguageRepository } from '../../../repositories/index.js';
import type { PaginationQuery } from '../../../utils/pagination.js';
import { normalizePagination } from '../../../utils/pagination.js';

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
      languages,
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
    return language;
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
