import { adminUserTypeRepository } from '@repositories/index';
import { normalizePagination, type PaginationQuery } from '@/utils/pagination';
import { normalizePrismaError } from '@/utils/prismaError';
import { isNonEmptyString } from '@/utils/validation';

export const adminUserTypeService = {
  async list(adminId: string, query: PaginationQuery & { searchKey?: string }) {
    if (!isNonEmptyString(adminId)) throw new Error('invalid adminId');

    try {
      const { offset, limit } = normalizePagination(query);
      const [totalCount, userTypes] =
        await adminUserTypeRepository.listActiveByAdmin(
          adminId,
          limit,
          offset,
          { searchKey: query.searchKey },
        );

      return {
        userTypes,
        pagination: {
          totalCount,
          offset,
          limit,
        },
      };
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },
};
