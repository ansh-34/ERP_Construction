import { Messages } from '../../../constants/index.js';
import { InventoryRepository } from '../../../repositories/index.js';
import type { PaginationQuery } from '../../../utils/pagination.js';
import { normalizePagination } from '../../../utils/pagination.js';
import { translateResponse } from '../../../utils/translation.js';
import prisma from '../../../infra/database/prisma/prisma.client.js';

const isUniqueConstraintError = (error: unknown) =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  (error as { code: string }).code === 'P2002';

export const InventoryService = {
  // ─── Stats ──────────────────────────────────────────────
  async getStats(domainId: string) {
    const where = { domainId, isDeleted: false };

    const [
      totalItems,
      activeCount,
      inactiveCount,
      outOfStockCount,
      aggregation,
    ] = await prisma.$transaction([
      prisma.inventory.count({ where }),
      prisma.inventory.count({ where: { ...where, status: 'ACTIVE' } }),
      prisma.inventory.count({ where: { ...where, status: 'INACTIVE' } }),
      prisma.inventory.count({ where: { ...where, quantity: 0 } }),
      prisma.inventory.aggregate({
        where,
        _sum: { quantity: true },
      }),
    ]);

    const lowStockCount = await InventoryRepository.getLowStockCount(domainId);

    // Unique product count via raw SQL
    const uniqueProducts = await prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(DISTINCT "productId")::bigint AS count
      FROM "Inventory"
      WHERE "domainId" = ${domainId}::uuid AND "isDeleted" = false
    `;

    return {
      totalItems,
      activeCount,
      inactiveCount,
      totalQuantity: aggregation._sum.quantity ?? 0,
      lowStockCount,
      outOfStockCount,
      uniqueProductCount: Number(uniqueProducts[0].count),
    };
  },

  // ─── List ───────────────────────────────────────────────
  async listInventory(
    domainId: string,
    query: PaginationQuery & { status?: 'ACTIVE' | 'INACTIVE' },
    langCode?: string,
  ) {
    const { offset, limit } = normalizePagination(query);

    const [totalCount, items] = await InventoryRepository.listByDomain(
      domainId,
      limit,
      offset,
      query.status,
    );

    return {
      items: translateResponse(items, langCode),
      pagination: {
        totalCount,
        offset,
        limit,
      },
    };
  },

  // ─── Create Entry ──────────────────────────────────────
  async createEntry(
    domainId: string,
    data: {
      productId: string;
      productGradeId: string;
      quantity: number;
      uomId: string;
      reorderLevel?: number;
    },
  ) {
    // Validate product exists & belongs to domain
    const product = await prisma.product.findFirst({
      where: { id: data.productId, domainId, isDeleted: false },
    });
    if (!product) throw new Error(Messages.INVENTORY.PRODUCT_NOT_FOUND);

    // Validate grade exists & belongs to product
    const grade = await prisma.productGrades.findFirst({
      where: {
        id: data.productGradeId,
        productId: data.productId,
        domainId,
        isDeleted: false,
      },
    });
    if (!grade) throw new Error(Messages.INVENTORY.GRADE_NOT_FOUND);

    // Validate UOM exists & belongs to domain
    const uom = await prisma.uom.findFirst({
      where: { id: data.uomId, domainId, isDeleted: false },
    });
    if (!uom) throw new Error(Messages.INVENTORY.UOM_NOT_FOUND);

    try {
      return await InventoryRepository.create({
        productId: data.productId,
        productGradeId: data.productGradeId,
        quantity: data.quantity,
        uomId: data.uomId,
        reorderLevel: data.reorderLevel ?? 0,
        domainId,
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new Error(Messages.INVENTORY.DUPLICATE_ENTRY);
      }
      throw error;
    }
  },

  // ─── Reorder Level Update ──────────────────────────────
  async updateReorderLevel(domainId: string, id: string, reorderLevel: number) {
    const record = await InventoryRepository.findByIdAndDomain(id, domainId);
    if (!record) throw new Error(Messages.INVENTORY.NOT_FOUND);

    return InventoryRepository.update(id, { reorderLevel });
  },

  // ─── Delete Entry ──────────────────────────────────────
  async deleteEntry(domainId: string, id: string) {
    const record = await InventoryRepository.findByIdAndDomain(id, domainId);
    if (!record) throw new Error(Messages.INVENTORY.NOT_FOUND);

    return InventoryRepository.softDelete(id);
  },
};
