import { UserRepository } from '../../../repositories/index.js';
import type { PaginationQuery } from '../../../utils/pagination.js';
import { normalizePagination } from '../../../utils/pagination.js';

export const UserListService = {
  async listUsers(
    domainId: string,
    query: PaginationQuery & { roleCode?: string },
  ) {
    const { offset, limit } = normalizePagination(query);

    const [totalCount, users] = await UserRepository.listByDomain(
      domainId,
      limit,
      offset,
      query.roleCode,
    );

    return {
      users,
      pagination: {
        totalCount,
        offset,
        limit,
      },
    };
  },
};
