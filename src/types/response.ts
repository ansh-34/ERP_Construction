export type DateRangeFilter = {
  from?: string;
  to?: string;
};

export type Filter = {
  offset: number;
  limit: number;
};

export type Pagination = {
  currentCount: number;
  totalCount: number;
} & Partial<Filter>;

export type ListResponse<T> = {
  pagination: Pagination;
  data: T[];
  success: boolean;
  message: string;
};

export type DetailResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type NormalResponse = {
  success: boolean;
  message: string;
};
