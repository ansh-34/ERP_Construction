import {
  machineryInventoryRepository,
  type MachineryInventoryFilters,
} from '@repositories/index';
import { normalizePagination, type PaginationQuery } from '@/utils/pagination';
import { normalizePrismaError } from '@/utils/prismaError';
import { isNonEmptyString } from '@/utils/validation';

type MachineryInventoryRecord = Awaited<
  ReturnType<typeof machineryInventoryRepository.findById>
>;

type PaginatedMachineryInventories = {
  machineryInventories: Awaited<
    ReturnType<typeof machineryInventoryRepository.findMany>
  >;
  pagination: {
    totalCount: number;
    currentCount: number;
    offset: number;
    limit: number;
  };
};

export const machineryInventoryService = {
  async getAll(
    domainId: string,
    adminId: string,
    query: PaginationQuery & MachineryInventoryFilters,
  ): Promise<PaginatedMachineryInventories> {
    if (!isNonEmptyString(domainId)) throw new Error('invalid domainId');
    if (!isNonEmptyString(adminId)) throw new Error('invalid adminId');

    try {
      const { offset, limit } = normalizePagination(query);
      const filters = {
        machineId: query.machineId,
        uomId: query.uomId,
        status: query.status,
        searchKey: query.searchKey,
      };

      const [totalCount, machineryInventories] = await Promise.all([
        machineryInventoryRepository.count(domainId, adminId, filters),
        machineryInventoryRepository.findMany(
          domainId,
          adminId,
          filters,
          offset,
          limit,
        ),
      ]);

      return {
        machineryInventories,
        pagination: {
          totalCount,
          currentCount: machineryInventories.length,
          offset,
          limit,
        },
      };
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  async getById(
    id: string,
    domainId: string,
    adminId: string,
  ): Promise<MachineryInventoryRecord> {
    if (!isNonEmptyString(id)) throw new Error('invalid id');
    if (!isNonEmptyString(domainId)) throw new Error('invalid domainId');
    if (!isNonEmptyString(adminId)) throw new Error('invalid adminId');

    try {
      return await machineryInventoryRepository.findById(id, domainId, adminId);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },
};
