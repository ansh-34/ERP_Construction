import { Messages } from '../../../constants/index.js';
import {
  InventoryItemRepository,
  InventoryRepository,
} from '../../../repositories/index.js';
import type { PaginationQuery } from '../../../utils/pagination.js';
import { normalizePagination } from '../../../utils/pagination.js';

const isUniqueConstraintError = (error: unknown) => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: string }).code === 'P2002'
  );
};

export const InventoryService = {
  async getInventory(domainId: string, query: PaginationQuery) {
    const { offset, limit } = normalizePagination(query);

    const inventory = await InventoryRepository.findByDomainId(domainId);

    if (!inventory) {
      throw new Error(Messages.INVENTORY.NOT_GENERATED);
    }

    const [totalCount, items] = await InventoryItemRepository.listByInventoryId(
      inventory.id,
      limit,
      offset,
    );

    return {
      items,
      pagination: {
        totalCount,
        offset,
        limit,
      },
    };
  },

  async addItemToInventory(
    domainId: string,
    data: {
      name: string;
      quantity: number;
      reorderLevel?: number;
      code?: string;
    },
  ) {
    const { name, quantity, reorderLevel, code } = data;

    if (!name || quantity === undefined) {
      throw new Error(Messages.INVENTORY.ITEM_DATA_REQUIRED);
    }

    const inventory = await InventoryRepository.findByDomainId(domainId);

    if (!inventory) {
      throw new Error(Messages.INVENTORY.NOT_GENERATED);
    }

    try {
      return await InventoryItemRepository.create({
        inventoryId: inventory.id,
        name,
        quantity,
        reorderLevel,
        code,
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new Error(Messages.INVENTORY.ITEM_ALREADY_EXISTS);
      }

      throw error;
    }
  },
};
