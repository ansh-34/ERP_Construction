import { UserRepository } from '../../../repositories/index.js';
import type { PaginationQuery } from '../../../utils/pagination.js';
import { normalizePagination } from '../../../utils/pagination.js';

export const UserListService = {
  async listUsers(domainId: string, query: PaginationQuery) {
    const { offset, limit } = normalizePagination(query);

    const [totalCount, users] = await UserRepository.listByDomain(
      domainId,
      limit,
      offset,
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
