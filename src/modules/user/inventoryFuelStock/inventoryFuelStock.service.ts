import {
  inventoryFuelStockRepository,
  type FuelType,
} from '@repositories/index';
import { StatusEnum } from '@constants/index';
import { normalizePrismaError } from '@/utils/prismaError';
import { normalizePagination, type PaginationQuery } from '@/utils/pagination';
import { isNonEmptyString } from '@/utils/validation';

type InventoryFuelStockRecord = Awaited<
  ReturnType<typeof inventoryFuelStockRepository.findById>
>;

type PaginatedInventoryFuelStocks = {
  inventoryFuelStocks: Awaited<
    ReturnType<typeof inventoryFuelStockRepository.findMany>
  >;
  pagination: {
    totalCount: number;
    currentCount: number;
    offset: number;
    limit: number;
  };
};

export const inventoryFuelStockService = {
  async getAll(
    domainId: string,
    adminId: string,
    query: PaginationQuery & {
      fuelType?: FuelType;
      uomId?: string;
      status?: StatusEnum;
      searchKey?: string;
    },
  ): Promise<PaginatedInventoryFuelStocks> {
    if (!isNonEmptyString(domainId)) throw new Error('invalid domainId');
    if (!isNonEmptyString(adminId)) throw new Error('invalid adminId');

    try {
      const { offset, limit } = normalizePagination(query);
      const filters = {
        fuelType: query.fuelType,
        uomId: query.uomId,
        status: query.status,
        searchKey: query.searchKey,
      };

      const [totalCount, inventoryFuelStocks] = await Promise.all([
        inventoryFuelStockRepository.count(domainId, filters),
        inventoryFuelStockRepository.findMany(domainId, filters, offset, limit),
      ]);

      return {
        inventoryFuelStocks,
        pagination: {
          totalCount,
          currentCount: inventoryFuelStocks.length,
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
  ): Promise<InventoryFuelStockRecord> {
    if (!isNonEmptyString(id)) throw new Error('invalid id');
    if (!isNonEmptyString(domainId)) throw new Error('invalid domainId');
    if (!isNonEmptyString(adminId)) throw new Error('invalid adminId');

    try {
      return await inventoryFuelStockRepository.findById(id, domainId);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },
};
