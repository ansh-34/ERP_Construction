import prisma from '../infra/database/prisma/prisma.client.js';
import { ApprovalStatus } from '../infra/database/prisma/generated/prisma/client/enums.js';

export const GrnRepository = {
  async create(data: any, products: any[]) {
    return prisma.$transaction(async (tx) => {
      const grn = await tx.grn.create({ data });

      if (products && products.length > 0) {
        await tx.grnProduct.createMany({
          data: products.map((p) => ({
            ...p,
            grnId: grn.id,
            grnCode: grn.code,
            domainId: grn.domainId,
          })),
        });
        await GrnRepository.recalculateGrnTotals(tx, grn.id, grn.domainId);
      }

      return tx.grn.findFirst({
        where: { id: grn.id },
        include: { grnProducts: { include: { uom: true } } },
      });
    });
  },

  async recalculateGrnTotals(tx: any, grnId: string, domainId: string) {
    const totals = await tx.grnProduct.aggregate({
      where: { grnId, domainId, isDeleted: false },
      _sum: {
        tax: true,
      },
      _count: {
        _all: true,
      },
    });

    const products = await tx.grnProduct.findMany({
      where: { grnId, domainId, isDeleted: false },
      select: { quantity: true, rate: true },
    });

    const totalAmount = products.reduce(
      (sum: number, p: any) => sum + p.quantity * p.rate,
      0,
    ) + (totals._sum.tax || 0);

    const totalTax = totals._sum.tax || 0;

    await tx.grn.update({
      where: { id: grnId },
      data: {
        totalItems: totals._count._all,
        totalTax,
        totalAmount,
      },
    });
  },

  async findByIdAndDomain(id: string, domainId: string) {
    return prisma.grn.findFirst({
      where: { id, domainId, isDeleted: false },
    });
  },

  async findByIdWithDetails(id: string, domainId: string) {
    return prisma.grn.findFirst({
      where: { id, domainId, isDeleted: false },
      include: {
        project: true,
        grnProducts: {
          where: { isDeleted: false },
          include: { uom: true, project: true },
        },
      },
    });
  },

  async listByDomain(
    domainId: string,
    limit: number,
    offset: number,
    filters: {
      status?: string;
      searchKey?: string;
      approvalStatus?: string;
      projectId?: string;
    },
  ) {
    const where: any = {
      domainId,
      isDeleted: false,
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.approvalStatus
        ? { approvalStatus: filters.approvalStatus }
        : {}),
      ...(filters.projectId ? { projectId: filters.projectId } : {}),
      ...(filters.searchKey
        ? {
            OR: [
              { code: { contains: filters.searchKey, mode: 'insensitive' } },
              { vendor: { contains: filters.searchKey, mode: 'insensitive' } },
              {
                wbReference: {
                  contains: filters.searchKey,
                  mode: 'insensitive',
                },
              },
              {
                productOrderCode: {
                  contains: filters.searchKey,
                  mode: 'insensitive',
                },
              },
            ],
          }
        : {}),
    };

    return prisma.$transaction([
      prisma.grn.count({ where }),
      prisma.grn.findMany({
        where,
        include: {
          project: true,
          grnProducts: {
            where: { isDeleted: false },
            include: { uom: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
    ]);
  },

  async update(id: string, data: any) {
    return prisma.grn.update({ where: { id }, data });
  },

  async softDelete(id: string) {
    return prisma.$transaction(async (tx) => {
      await tx.grnProduct.updateMany({
        where: { grnId: id },
        data: { isDeleted: true },
      });
      return tx.grn.update({
        where: { id },
        data: { isDeleted: true },
      });
    });
  },

  async approveAndUpdateInventory(id: string, domainId: string) {
    return prisma.$transaction(async (tx) => {
      const grn = await tx.grn.findFirst({
        where: { id, domainId, isDeleted: false },
        include: {
          grnProducts: { where: { isDeleted: false } },
        },
      });

      if (!grn) throw new Error('GRN not found');

      for (const item of grn.grnProducts) {
        const existingInventory = await tx.inventory.findFirst({
          where: {
            domainId,
            isDeleted: false,
            product: { code: item.material },
            uomId: item.uomId,
          },
        });

        if (existingInventory) {
          await tx.inventory.update({
            where: { id: existingInventory.id },
            data: { quantity: { increment: item.quantity } },
          });
        }
      }

      return tx.grn.update({
        where: { id },
        data: {
          approvalStatus: ApprovalStatus.APPROVED,
          approvedAt: new Date(),
        },
      });
    });
  },

  async reject(id: string) {
    return prisma.grn.update({
      where: { id },
      data: {
        approvalStatus: ApprovalStatus.REJECTED,
        approvedAt: new Date(),
      },
    });
  },

  async createGrnProduct(grnId: string, domainId: string, data: any) {
    return prisma.$transaction(async (tx) => {
      const product = await tx.grnProduct.create({ data });
      await GrnRepository.recalculateGrnTotals(tx, grnId, domainId);
      return product;
    });
  },

  async listGrnProducts(grnId: string, domainId: string) {
    return prisma.grnProduct.findMany({
      where: { grnId, domainId, isDeleted: false },
      include: { uom: true },
      orderBy: { createdAt: 'asc' },
    });
  },

  async getGrnProductById(id: string, grnId: string, domainId: string) {
    return prisma.grnProduct.findFirst({
      where: { id, grnId, domainId, isDeleted: false },
    });
  },

  async updateGrnProduct(id: string, grnId: string, domainId: string, data: any) {
    return prisma.$transaction(async (tx) => {
      const product = await tx.grnProduct.update({
        where: { id },
        data,
      });
      await GrnRepository.recalculateGrnTotals(tx, grnId, domainId);
      return product;
    });
  },

  async deleteGrnProduct(id: string, grnId: string, domainId: string) {
    return prisma.$transaction(async (tx) => {
      const product = await tx.grnProduct.update({
        where: { id },
        data: { isDeleted: true, status: 'INACTIVE' },
      });
      await GrnRepository.recalculateGrnTotals(tx, grnId, domainId);
      return product;
    });
  },
};
