import prisma from '../infra/database/prisma/prisma.client.js';
import { ApprovalStatus } from '../infra/database/prisma/generated/prisma/client/enums.js';

export const GrnRepository = {
  mapGrnProduct(product: any) {
    if (!product) return product;
    const quantity = product.quantity ?? 0;
    const rate = product.rate ?? 0;
    const tax = product.tax ?? 0;
    product.amt = quantity * rate + tax;
    return product;
  },

  mapGrn(grn: any) {
    if (!grn) return grn;
    if (grn.grnProducts && Array.isArray(grn.grnProducts)) {
      grn.grnProducts = grn.grnProducts.map(GrnRepository.mapGrnProduct);
    }
    return grn;
  },

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

      const res = await tx.grn.findFirst({
        where: { id: grn.id },
        include: { grnProducts: { include: { uom: true } } },
      });
      return GrnRepository.mapGrn(res);
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

    const totalAmount =
      products.reduce((sum: number, p: any) => sum + p.quantity * p.rate, 0) +
      (totals._sum.tax || 0);

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
    return prisma.$transaction(async (tx) => {
      await GrnRepository.recalculateGrnTotals(tx, id, domainId);
      const grn = await tx.grn.findFirst({
        where: { id, domainId, isDeleted: false },
        include: {
          project: true,
          invoice: true,
          grnProducts: {
            where: { isDeleted: false },
            include: { uom: true, project: true, invoice: true },
          },
        },
      });
      return GrnRepository.mapGrn(grn);
    });
  },

  async listByDomain(
    domainId: string,
    limit: number,
    offset: number,
    filters: {
      status?: 'ACTIVE' | 'INACTIVE';
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
              {
                vendorName: {
                  contains: filters.searchKey,
                  mode: 'insensitive',
                },
              },
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

    const [total, grns] = await prisma.$transaction([
      prisma.grn.count({ where }),
      prisma.grn.findMany({
        where,
        include: {
          project: true,
          invoice: true,
          grnProducts: {
            where: { isDeleted: false },
            include: { uom: true, invoice: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
    ]);
    return [total, grns.map(GrnRepository.mapGrn)] as [number, any[]];
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
        // Try to find product by code or en displayName matching material
        const product = await tx.product.findFirst({
          where: {
            domainId,
            isDeleted: false,
            OR: [
              { code: item.material },
              { displayName: { path: ['en'], equals: item.material } },
            ],
          },
          include: {
            productGrades: {
              where: { domainId, isDeleted: false },
            },
          },
        });

        let productId: string | null = product?.id || null;
        let productGradeId: string | null =
          product?.productGrades?.[0]?.id || null;

        // Try lookup via invoiceItem
        if (!productId || !productGradeId) {
          const invoiceItem = await tx.invoiceItem.findFirst({
            where: {
              invoiceId: item.invoiceId,
              uomId: item.uomId,
            },
          });
          if (invoiceItem) {
            productId = invoiceItem.productId;
            productGradeId = invoiceItem.productGradeId;
          }
        }

        // Fallback to any active product/grade in the domain if still not found
        if (!productId || !productGradeId) {
          const fallbackProduct = await tx.product.findFirst({
            where: { domainId, isDeleted: false },
            include: {
              productGrades: {
                where: { domainId, isDeleted: false },
              },
            },
          });
          if (fallbackProduct) {
            productId = fallbackProduct.id;
            productGradeId = fallbackProduct.productGrades[0]?.id || null;
          }
        }

        if (productId && productGradeId) {
          const existingInventory = await tx.inventory.findFirst({
            where: {
              productId,
              productGradeId,
              domainId,
              isDeleted: false,
            },
          });

          if (existingInventory) {
            await tx.inventory.update({
              where: { id: existingInventory.id },
              data: { quantity: { increment: item.quantity } },
            });
          } else {
            await tx.inventory.create({
              data: {
                productId,
                productGradeId,
                quantity: item.quantity,
                uomId: item.uomId,
                reorderLevel: 0,
                domainId,
                status: 'ACTIVE',
                isDeleted: false,
              },
            });
          }
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
      const product = await tx.grnProduct.create({
        data: {
          ...data,
          grnId,
          domainId,
        },
      });
      await GrnRepository.recalculateGrnTotals(tx, grnId, domainId);
      return GrnRepository.mapGrnProduct(product);
    });
  },

  async listGrnProducts(grnId: string, domainId: string) {
    const products = await prisma.grnProduct.findMany({
      where: { grnId, domainId, isDeleted: false },
      include: { uom: true },
      orderBy: { createdAt: 'asc' },
    });
    return products.map(GrnRepository.mapGrnProduct);
  },

  async getGrnProductById(id: string, grnId: string, domainId: string) {
    const product = await prisma.grnProduct.findFirst({
      where: { id, grnId, domainId, isDeleted: false },
    });
    return GrnRepository.mapGrnProduct(product);
  },

  async updateGrnProduct(
    id: string,
    grnId: string,
    domainId: string,
    data: any,
  ) {
    return prisma.$transaction(async (tx) => {
      const product = await tx.grnProduct.update({
        where: { id },
        data,
      });
      await GrnRepository.recalculateGrnTotals(tx, grnId, domainId);
      return GrnRepository.mapGrnProduct(product);
    });
  },

  async deleteGrnProduct(id: string, grnId: string, domainId: string) {
    return prisma.$transaction(async (tx) => {
      const product = await tx.grnProduct.update({
        where: { id },
        data: { isDeleted: true, status: 'INACTIVE' },
      });
      await GrnRepository.recalculateGrnTotals(tx, grnId, domainId);
      return GrnRepository.mapGrnProduct(product);
    });
  },
};
