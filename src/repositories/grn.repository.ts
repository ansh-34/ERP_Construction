import prisma from '../infra/database/prisma/prisma.client.js';
import { ApprovalStatus } from '../infra/database/prisma/generated/prisma/client/enums.js';

export const GrnRepository = {
  mapGrnProduct(product: any) {
    if (!product) return product;
    const quantity = product.quantity ?? 0;
    const rate = product.rate ?? 0;
    product.amt = quantity * rate;
    return product;
  },

  count(options: {
    filters: {
      domainId?: string;
      status?: 'ACTIVE' | 'INACTIVE';
      searchKey?: string;
      adminId?: string;
      approvalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
    };
  }) {
    const whereClause: any = {
      isDeleted: false,
      ...(options.filters && {
        ...(options.filters.domainId && { domainId: options.filters.domainId }),
        ...(options.filters.status && { status: options.filters.status }),
        ...(options.filters.searchKey && {
          searchText: { contains: options.filters.searchKey },
        }),
        ...(options.filters.adminId && { adminId: options.filters.adminId }),
        ...(options.filters.approvalStatus && {
          approvalStatus: options.filters.approvalStatus,
        }),
      }),
    };

    return prisma.grn.count({ where: whereClause });
  },

  mapGrn(grn: any) {
    if (!grn) return grn;
    if (grn.grnProducts && Array.isArray(grn.grnProducts)) {
      grn.grnProducts = grn.grnProducts.map(GrnRepository.mapGrnProduct);
    }
    if (grn && typeof grn === 'object') {
      delete grn.productOrderCode;
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
        include: { grnProducts: { include: { uom: true, product: true } } },
      });
      return GrnRepository.mapGrn(res);
    });
  },

  async recalculateInvoiceGrnStats(
    tx: any,
    invoiceId: string,
    domainId: string,
  ) {
    const activeGrns = await tx.grn.findMany({
      where: { invoiceId, domainId, isDeleted: false },
      select: { id: true, date: true },
    });

    const totalGrns = activeGrns.length;
    let lastGrnDate: Date | null = null;
    if (totalGrns > 0) {
      lastGrnDate = new Date(
        Math.max(...activeGrns.map((g: any) => g.date.getTime())),
      );
    }

    const grnProducts = await tx.grnProduct.findMany({
      where: {
        invoiceId,
        domainId,
        isDeleted: false,
        grn: { isDeleted: false },
      },
    });

    const totalItemsReceived = grnProducts.reduce(
      (sum: number, p: any) => sum + p.quantity,
      0,
    );

    const invoiceItems = await tx.invoiceItem.findMany({
      where: { invoiceId, domainId },
    });

    const totalItems = invoiceItems.reduce(
      (sum: number, item: any) => sum + item.quantity,
      0,
    );

    for (const item of invoiceItems) {
      const receivedQuantity = grnProducts
        .filter(
          (p: any) => p.uomId === item.uomId && p.productId === item.productId,
        )
        .reduce((sum: number, p: any) => sum + p.quantity, 0);

      await tx.invoiceItem.update({
        where: { id: item.id },
        data: { receivedQuantity },
      });
    }

    await tx.invoice.update({
      where: { id: invoiceId },
      data: {
        totalGrns,
        lastGrnDate,
        totalItems,
        totalItemsReceived,
      },
    });
  },

  async recalculateGrnTotals(tx: any, grnId: string, domainId: string) {
    const totals = await tx.grnProduct.aggregate({
      where: { grnId, domainId, isDeleted: false },
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
    );

    const updatedGrn = await tx.grn.update({
      where: { id: grnId },
      data: {
        totalItems: totals._count._all,
        totalAmount,
      },
      select: { invoiceId: true },
    });

    if (updatedGrn?.invoiceId) {
      await GrnRepository.recalculateInvoiceGrnStats(
        tx,
        updatedGrn.invoiceId as string,
        domainId,
      );
    }
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
            include: { uom: true, product: true, project: true, invoice: true },
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
      invoiceId?: string;
      referenceType?: string;
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
      ...(filters.invoiceId ? { invoiceId: filters.invoiceId } : {}),
      ...(filters.referenceType
        ? { referenceType: filters.referenceType }
        : {}),
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
            include: { uom: true, product: true, invoice: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
    ]);
    return [total, grns.map(GrnRepository.mapGrn)] as [number, any[]];
  },

  async update(id: string, data: any, tx?: any) {
    const client = tx || prisma;
    return client.grn.update({ where: { id }, data });
  },

  async softDelete(id: string) {
    return prisma.$transaction(async (tx) => {
      await tx.grnProduct.updateMany({
        where: { grnId: id },
        data: { isDeleted: true },
      });
      const grn = await tx.grn.update({
        where: { id },
        data: { isDeleted: true },
      });
      if (grn.invoiceId) {
        await GrnRepository.recalculateInvoiceGrnStats(
          tx,
          grn.invoiceId,
          grn.domainId,
        );
      }
      return grn;
    });
  },

  async approveAndUpdateInventory(id: string, domainId: string) {
    return prisma.$transaction(async (tx) => {
      const grn = await tx.grn.findFirst({
        where: { id, domainId, isDeleted: false },
        include: {
          grnProducts: { where: { isDeleted: false } },
          // Grn.vendor is a VendorProductPricing row; its vendorId is the actual
          // Vendor, and it carries a fallback price/currency. A PO can span many
          // vendors (one per GRN/invoice), so resolve price per line item below.
          vendor: { select: { vendorId: true, price: true, currencyId: true } },
        },
      });

      if (!grn) throw new Error('GRN not found');

      const grnVendorId = grn.vendor?.vendorId ?? null;
      const fallbackPrice = grn.vendor?.price ?? null;
      const fallbackCurrencyId = grn.vendor?.currencyId ?? null;

      for (const item of grn.grnProducts) {
        const productId: string | null = item.productId ?? null;
        const productGradeId: string | null = item.productGradeId ?? null;

        if (productId && productGradeId && item.uomId) {
          // Resolve the vendor price for THIS specific line item. The GRN's
          // vendor may price many products, so match on vendor + product +
          // grade + uom; fall back to product + grade, then the GRN vendor row.
          let linePrice = fallbackPrice;
          let lineCurrencyId = fallbackCurrencyId;
          if (grnVendorId) {
            const vpp =
              (await tx.vendorProductPricing.findFirst({
                where: {
                  vendorId: grnVendorId,
                  productId,
                  productGradeId,
                  uomId: item.uomId,
                  domainId,
                  isDeleted: false,
                  status: 'ACTIVE',
                },
                orderBy: { updatedAt: 'desc' },
                select: { price: true, currencyId: true },
              })) ??
              (await tx.vendorProductPricing.findFirst({
                where: {
                  vendorId: grnVendorId,
                  productId,
                  productGradeId,
                  domainId,
                  isDeleted: false,
                  status: 'ACTIVE',
                },
                orderBy: { updatedAt: 'desc' },
                select: { price: true, currencyId: true },
              }));
            if (vpp) {
              linePrice = vpp.price;
              lineCurrencyId = vpp.currencyId;
            }
          }

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
              data: {
                quantity: { increment: item.quantity },
                // refresh price/currency from this approved GRN's vendor price
                price: linePrice,
                currencyId: lineCurrencyId,
              },
            });
          } else {
            await tx.inventory.create({
              data: {
                productId,
                productGradeId,
                quantity: item.quantity,
                uomId: item.uomId,
                reorderLevel: 0,
                price: linePrice,
                currencyId: lineCurrencyId,
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
        include: { uom: true, product: true },
      });
      await GrnRepository.recalculateGrnTotals(tx, grnId, domainId);
      return GrnRepository.mapGrnProduct(product);
    });
  },

  async listGrnProducts(grnId: string, domainId: string) {
    const products = await prisma.grnProduct.findMany({
      where: { grnId, domainId, isDeleted: false },
      include: { uom: true, product: true },
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
        include: { uom: true, product: true },
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

  async findFirst(args: any, tx?: any) {
    const client = tx || prisma;
    return client.grn.findFirst(args);
  },

  async updateGrnProductRaw(id: string, data: any, tx?: any) {
    const client = tx || prisma;
    return client.grnProduct.update({ where: { id }, data });
  },

  async createGrnProductRaw(data: any, tx?: any) {
    const client = tx || prisma;
    return client.grnProduct.create({ data });
  },
};
