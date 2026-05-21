import prisma from '@/infra/database/prisma/prisma.client';

const asPrisma = prisma as any;

const toDisplayString = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    if (typeof record.en === 'string') return record.en;
    if (typeof record.name === 'string') return record.name;
  }
  return JSON.stringify(value ?? '');
};

export const RawMaterialPurchaseRequestRepository = {
  async create(data: any) {
    return prisma.rawMaterialPurchaseRequest.create({ data });
  },

  async findByIdAndDomain(id: string, domainId: string) {
    return prisma.rawMaterialPurchaseRequest.findFirst({
      where: { id, domainId, isDeleted: false },
    });
  },

  async findByIdWithDetails(id: string, domainId: string) {
    return prisma.rawMaterialPurchaseRequest.findFirst({
      where: { id, domainId, isDeleted: false },
      include: {
        product: true,
        productGrade: true,
        uom: true,
        requestedUser: { select: { id: true, name: true, email: true } },
        project: true,
        purchaseOrder: true,
      },
    });
  },

  async listByDomain(
    domainId: string,
    limit: number,
    offset: number,
    filters: {
      status?: 'ACTIVE' | 'INACTIVE';
      searchKey?: string;
      type?: string;
      approvalStatus?: string;
      productId?: string;
      projectId?: string;
      isDeleted?: boolean;
    },
  ) {
    const where: any = {
      domainId,
      isDeleted: filters.isDeleted ?? false,
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.type ? { type: filters.type } : {}),
      ...(filters.approvalStatus
        ? { approvalStatus: filters.approvalStatus }
        : {}),
      ...(filters.productId ? { productId: filters.productId } : {}),
      ...(filters.projectId ? { projectId: filters.projectId } : {}),
      ...(filters.searchKey
        ? {
            OR: [
              { code: { contains: filters.searchKey, mode: 'insensitive' } },
              { brand: { contains: filters.searchKey, mode: 'insensitive' } },
              { reason: { contains: filters.searchKey, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    return prisma.$transaction([
      prisma.rawMaterialPurchaseRequest.count({ where }),
      prisma.rawMaterialPurchaseRequest.findMany({
        where,
        include: {
          product: true,
          productGrade: true,
          uom: true,
          requestedUser: { select: { id: true, name: true, email: true } },
          project: true,
          purchaseOrder: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
    ]);
  },

  async update(id: string, data: any) {
    return prisma.rawMaterialPurchaseRequest.update({
      where: { id },
      data,
    });
  },

  async softDelete(id: string) {
    return prisma.rawMaterialPurchaseRequest.update({
      where: { id },
      data: { isDeleted: true, status: 'INACTIVE' },
    });
  },

  async bulkUpdateApproval(
    ids: string[],
    approvalStatus: string,
    domainId: string,
  ) {
    return prisma.rawMaterialPurchaseRequest.updateMany({
      where: { id: { in: ids }, domainId, isDeleted: false },
      data: {
        approvalStatus: approvalStatus as any,
        approvedAt: approvalStatus === 'APPROVED' ? new Date() : null,
      },
    });
  },

  async approveAndCreatePO(id: string, domainId: string, poCode: string) {
    return asPrisma.$transaction(async (tx: any) => {
      const request = await tx.rawMaterialPurchaseRequest.findFirst({
        where: {
          id,
          domainId,
          isDeleted: false,
          approvalStatus: { in: ['PENDING', 'REJECTED'] },
        },
        include: { product: true, productGrade: true },
      });

      if (!request) {
        throw new Error('Purchase request not found or already approved');
      }

      if (request.purchaseOrderId) {
        throw new Error('Purchase order already created for this request');
      }

      const po = await tx.purchaseOrder.create({
        data: {
          code: poCode,
          sourceRmprCode: request.code,
          uomId: request.uomId,
          totalItems: 0,
          totalTax: 0,
          totalAmount: 0,
          orderStatus: 'DRAFT',
          projectId: request.projectId,
          domainId: request.domainId,
        },
      });

      await tx.purchaseOrderProduct.create({
        data: {
          purchaseOrderId: po.id,
          orderCode: po.code,
          productName: toDisplayString(request.product.displayName),
          productGradeName: request.productGrade
            ? toDisplayString(request.productGrade.gradeDisplayName)
            : undefined,
          quantity: request.quantity,
          uomId: request.uomId,
          rate: 0,
          tax: 0,
          projectId: request.projectId,
          domainId: request.domainId,
        },
      });

      const totals = await tx.purchaseOrderProduct.aggregate({
        where: { purchaseOrderId: po.id, domainId, isDeleted: false },
        _count: { _all: true },
        _sum: { tax: true },
      });

      const lineItems = await tx.purchaseOrderProduct.findMany({
        where: { purchaseOrderId: po.id, domainId, isDeleted: false },
        select: { quantity: true, rate: true, tax: true },
      });

      const totalAmount = lineItems.reduce(
        (sum: number, item: any) =>
          sum + item.rate * item.quantity + item.tax * item.quantity,
        0,
      );

      const updatedPo = await tx.purchaseOrder.update({
        where: { id: po.id },
        data: {
          totalItems: totals._count._all,
          totalTax: lineItems.reduce(
            (sum: number, item: any) => sum + item.tax * item.quantity,
            0,
          ),
          totalAmount,
        },
        include: { purchaseOrderProducts: true },
      });

      const updatedRequest = await tx.rawMaterialPurchaseRequest.update({
        where: { id: request.id },
        data: {
          approvalStatus: 'APPROVED',
          approvedAt: new Date(),
          purchaseOrderId: po.id,
        },
      });

      return { request: updatedRequest, purchaseOrder: updatedPo };
    });
  },

  // Purchase Order Methods

  async listPurchaseOrders(
    domainId: string,
    limit: number,
    offset: number,
    filters: {
      status?: 'ACTIVE' | 'INACTIVE';
      orderStatus?: string;
      projectId?: string;
      isDeleted?: boolean;
    },
  ) {
    const where: any = {
      domainId,
      isDeleted: filters.isDeleted ?? false,
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.orderStatus ? { orderStatus: filters.orderStatus } : {}),
      ...(filters.projectId ? { projectId: filters.projectId } : {}),
    };

    return prisma.$transaction([
      prisma.purchaseOrder.count({ where }),
      prisma.purchaseOrder.findMany({
        where,
        include: { project: true, uom: true },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
    ]);
  },

  async getPurchaseOrderById(id: string, domainId: string) {
    return prisma.purchaseOrder.findFirst({
      where: { id, domainId, isDeleted: false },
      include: {
        project: true,
        uom: true,
        purchaseOrderProducts: {
          where: { isDeleted: false },
          include: { uom: true },
        },
      },
    });
  },

  // async updatePurchaseOrder(id: string, data: any) {
  //   return prisma.purchaseOrder.update({
  //     where: { id },
  //     data,
  //   });
  // },

  // // --- Purchase Order Product Methods ---

  // async recalculatePoTotals(tx: any, purchaseOrderId: string, domainId: string) {
  //   const totals = await tx.purchaseOrderProduct.aggregate({
  //     where: { purchaseOrderId, domainId, isDeleted: false },
  //     _count: { _all: true },
  //     _sum: { tax: true },
  //   });

  //   const lineItems = await tx.purchaseOrderProduct.findMany({
  //     where: { purchaseOrderId, domainId, isDeleted: false },
  //     select: { quantity: true, rate: true, tax: true },
  //   });

  //   const totalAmount = lineItems.reduce(
  //     (sum: number, item: any) =>
  //       sum + item.rate * item.quantity + item.tax * item.quantity,
  //     0,
  //   );

  //   const totalTax = lineItems.reduce(
  //     (sum: number, item: any) => sum + item.tax * item.quantity,
  //     0,
  //   );

  //   return tx.purchaseOrder.update({
  //     where: { id: purchaseOrderId },
  //     data: {
  //       totalItems: totals._count._all,
  //       totalTax,
  //       totalAmount,
  //     },
  //   });
  // },

  // async createPoProduct(purchaseOrderId: string, domainId: string, data: any) {
  //   return asPrisma.$transaction(async (tx: any) => {
  //     const product = await tx.purchaseOrderProduct.create({ data });
  //     await RawMaterialPurchaseRequestRepository.recalculatePoTotals(tx, purchaseOrderId, domainId);
  //     return product;
  //   });
  // },

  async listPoProducts(purchaseOrderId: string, domainId: string) {
    return prisma.purchaseOrderProduct.findMany({
      where: { purchaseOrderId, domainId, isDeleted: false },
      include: { uom: true },
      orderBy: { createdAt: 'asc' },
    });
  },

  async getPoProductById(
    id: string,
    purchaseOrderId: string,
    domainId: string,
  ) {
    return prisma.purchaseOrderProduct.findFirst({
      where: { id, purchaseOrderId, domainId, isDeleted: false },
    });
  },

  //   async updatePoProduct(id: string, purchaseOrderId: string, domainId: string, data: any) {
  //     return asPrisma.$transaction(async (tx: any) => {
  //       const product = await tx.purchaseOrderProduct.update({
  //         where: { id },
  //         data,
  //       });
  //       await RawMaterialPurchaseRequestRepository.recalculatePoTotals(tx, purchaseOrderId, domainId);
  //       return product;
  //     });
  //   },

  //   async deletePoProduct(id: string, purchaseOrderId: string, domainId: string) {
  //     return asPrisma.$transaction(async (tx: any) => {
  //       const product = await tx.purchaseOrderProduct.update({
  //         where: { id },
  //         data: { isDeleted: true, status: 'INACTIVE' },
  //       });
  //       await RawMaterialPurchaseRequestRepository.recalculatePoTotals(tx, purchaseOrderId, domainId);
  //       return product;
  //     });
  //   },
};
