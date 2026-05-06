export type PaginationQuery = {
  offset?: number | string;
  limit?: number | string;
};

export type DatePaginationQuery = PaginationQuery & {
  from?: string;
  to?: string;
};

export const normalizePagination = (
  query: PaginationQuery,
  defaultLimit = 10,
) => {
  const offset = Number(query.offset) || 0;
  const limit = Number(query.limit) || defaultLimit;

  return {
    offset,
    limit,
  };
};
