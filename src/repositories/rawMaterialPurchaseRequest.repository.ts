import prisma from '@/infra/database/prisma/prisma.client';

const asPrisma = prisma as any;

async function enrichPoProductsWithCodes(products: any[], domainId: string) {
  if (!products || products.length === 0) return [];

  const poIds = Array.from(
    new Set(products.map((p: any) => p.purchaseOrderId).filter(Boolean))
  ) as string[];

  if (poIds.length === 0) {
    return products.map((pop: any) => {
      const {
        id,
        purchaseOrderId,
        orderCode,
        productName,
        productGradeName,
        quantity,
        tax,
        uomId,
        rate,
        projectId,
        domainId: popDomainId,
        status,
        isDeleted,
        createdAt,
        updatedAt,
        uom,
        ...otherFields
      } = pop;

      return {
        id,
        purchaseOrderId,
        orderCode,
        productName,
        productCode: null,
        productGradeName,
        productGradeCode: null,
        quantity,
        tax,
        uomId,
        uomCode: pop.uom?.code || null,
        rate,
        projectId,
        domainId: popDomainId,
        status,
        isDeleted,
        createdAt,
        updatedAt,
        uom,
        ...otherFields,
      };
    });
  }

  const rmprs = await prisma.rawMaterialPurchaseRequest.findMany({
    where: {
      purchaseOrderId: { in: poIds },
      domainId,
      isDeleted: false,
    },
    include: {
      product: true,
      productGrade: true,
      uom: true,
    },
  });

  return products.map((pop: any) => {
    const match = rmprs.find((req: any) => {
      const isPoMatch = req.purchaseOrderId === pop.purchaseOrderId;
      const isProductMatch =
        req.product &&
        JSON.stringify(req.product.displayName) === JSON.stringify(pop.productName);
      const isGradeMatch = req.productGrade
        ? pop.productGradeName &&
          JSON.stringify(req.productGrade.gradeDisplayName) ===
            JSON.stringify(pop.productGradeName)
        : !pop.productGradeName;
      const isUomMatch = req.uomId === pop.uomId;
      return isPoMatch && isProductMatch && isGradeMatch && isUomMatch;
    });

    const {
      id,
      purchaseOrderId,
      orderCode,
      productName,
      productGradeName,
      quantity,
      tax,
      uomId,
      rate,
      projectId,
      domainId: popDomainId,
      status,
      isDeleted,
      createdAt,
      updatedAt,
      uom,
      ...otherFields
    } = pop;

    return {
      id,
      purchaseOrderId,
      orderCode,
      productName,
      productCode: match?.product?.code || null,
      productGradeName,
      productGradeCode: match?.productGrade?.gradeCode || null,
      quantity,
      tax,
      uomId,
      uomCode: pop.uom?.code || match?.uom?.code || null,
      rate,
      projectId,
      domainId: popDomainId,
      status,
      isDeleted,
      createdAt,
      updatedAt,
      uom,
      ...otherFields,
    };
  });
}

export const RawMaterialPurchaseRequestRepository = {
  create(data: any, tx?: any, include?: any) {
    const client = tx || prisma;
    return client.rawMaterialPurchaseRequest.create({
      data,
      ...(include ? { include } : {}),
    });
  },

  async findByIdAndDomain(id: string, domainId: string) {
    return prisma.rawMaterialPurchaseRequest.findFirst({
      where: { id, domainId, isDeleted: false },
    });
  },

  async listAllPoProducts(
    domainId: string,
    offset: number,
    limit: number,
    options: {
      filters?: {
        purchaseOrderId?: string;
        domainId?: string;
        searchKey?: string;
      };
      select?: any;
    },
  ): Promise<[number, any[]]> {
    const where: any = {
      isDeleted: false,
      domainId,
      ...(options.filters && options.filters.purchaseOrderId
        ? { purchaseOrderId: options.filters.purchaseOrderId }
        : {}),
      ...(options.filters && options.filters.searchKey
        ? {
            OR: [
              {
                productName: {
                  contains: options.filters.searchKey,
                  mode: 'insensitive',
                },
              },
            ],
          }
        : {}),
      ...(options.filters && options.filters.domainId
        ? { domainId: options.filters.domainId }
        : {}),
    };

    const include = options.select ? undefined : { uom: true };

    const [count, products] = await Promise.all([
      prisma.purchaseOrderProduct.count({
        where,
      }),
      prisma.purchaseOrderProduct.findMany({
        where,
        ...(include ? { include } : {}),
        ...(options.select ? { select: options.select } : {}),
        orderBy: { createdAt: 'asc' },
        take: limit,
        skip: offset,
      }),
    ]);

    const enriched = await enrichPoProductsWithCodes(products, domainId);
    return [count, enriched];
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

  update(id: string, data: any, tx?: any) {
    const client = tx || prisma;
    return client.rawMaterialPurchaseRequest.update({
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

  async approveAndCreatePO(code: string, domainId: string, poCode: string) {
    return asPrisma.$transaction(async (tx: any) => {
      // Fetch all sibling requests that share the same request code
      const requests = await tx.rawMaterialPurchaseRequest.findMany({
        where: {
          code,
          domainId,
          isDeleted: false,
        },
        include: { product: true, productGrade: true },
      });

      if (requests.length === 0) {
        throw new Error('No purchase requests found for code');
      }

      // Check if any request in the unified group is already approved or has a PO
      const alreadyActioned = requests.some(
        (r: any) => r.approvalStatus === 'APPROVED' || r.purchaseOrderId,
      );
      if (alreadyActioned) {
        throw new Error(
          'One or more products in this request have already been approved or linked to a purchase order',
        );
      }

      const targetRequest = requests[0];

      const po = await tx.purchaseOrder.create({
        data: {
          code: poCode,
          sourceRmprCode: code,
          orderStatus: 'PENDING_VENDOR',
          projectId: targetRequest.projectId,
          domainId: targetRequest.domainId,
        },
      });

      // Create a PO product line item for each item in the RMPR group
      for (const req of requests) {
        await tx.purchaseOrderProduct.create({
          data: {
            purchaseOrderId: po.id,
            orderCode: po.code,
            productName: req.product.displayName as any,
            productGradeName: req.productGrade
              ? (req.productGrade.gradeDisplayName as any)
              : undefined,
            quantity: req.quantity,
            uomId: req.uomId,
            rate: 0,
            tax: 0,
            projectId: req.projectId,
            domainId: req.domainId,
          },
        });
      }

      // Update all items in the request to APPROVED and link to the PO
      await tx.rawMaterialPurchaseRequest.updateMany({
        where: {
          code: targetRequest.code,
          domainId,
          isDeleted: false,
        },
        data: {
          approvalStatus: 'APPROVED',
          approvedAt: new Date(),
          purchaseOrderId: po.id,
        },
      });

      // Retrieve the targetRequest updated state to return
      const updatedRequest = await tx.rawMaterialPurchaseRequest.findFirst({
        where: { id: targetRequest.id },
      });

      // Retrieve the full PO with products to return
      const fullPo = await tx.purchaseOrder.findFirst({
        where: { id: po.id },
        include: { purchaseOrderProducts: true },
      });

      return { request: updatedRequest, purchaseOrder: fullPo };
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
        include: { project: true },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
    ]);
  },

  async getPurchaseOrderById(id: string, domainId: string) {
    const po = await prisma.purchaseOrder.findFirst({
      where: { id, domainId, isDeleted: false },
      include: {
        project: true,
        purchaseOrderProducts: {
          where: { isDeleted: false },
          include: { uom: true },
        },
      },
    });

    if (!po) return null;

    const enrichedProducts = await enrichPoProductsWithCodes(
      po.purchaseOrderProducts,
      domainId,
    );

    return {
      ...po,
      purchaseOrderProducts: enrichedProducts,
    };
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
    const products = await prisma.purchaseOrderProduct.findMany({
      where: { purchaseOrderId, domainId, isDeleted: false },
      include: { uom: true },
      orderBy: { createdAt: 'asc' },
    });

    return enrichPoProductsWithCodes(products, domainId);
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

  async countByOptions(options: {
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
        ...(options.filters.adminId && { adminId: options.filters.adminId }),
        ...(options.filters.approvalStatus && {
          approvalStatus: options.filters.approvalStatus,
        }),
      }),
    };

    return prisma.rawMaterialPurchaseRequest.count({ where: whereClause });
  },

  async countPurchaseOrders(options: {
    filters: {
      domainId?: string;
      status?: 'ACTIVE' | 'INACTIVE';
      searchKey?: string;
      adminId?: string;
    };
  }) {
    const whereClause: any = {
      isDeleted: false,
      ...(options.filters && {
        ...(options.filters.domainId && { domainId: options.filters.domainId }),
        ...(options.filters.status && { status: options.filters.status }),
        ...(options.filters.adminId && { adminId: options.filters.adminId }),
      }),
    };

    return prisma.purchaseOrder.count({ where: whereClause });
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

  groupBy(args: any): Promise<any> {
    return (prisma.rawMaterialPurchaseRequest as any).groupBy(args);
  },

  findMany(args: any, tx?: any): Promise<any> {
    const client = tx || prisma;
    return client.rawMaterialPurchaseRequest.findMany(args) as Promise<any>;
  },

  findFirst(args: any, tx?: any): Promise<any> {
    const client = tx || prisma;
    return client.rawMaterialPurchaseRequest.findFirst(args) as Promise<any>;
  },

  count(args: any, tx?: any): Promise<any> {
    const client = tx || prisma;
    return client.rawMaterialPurchaseRequest.count(args) as Promise<any>;
  },

  updateMany(args: any, tx?: any): Promise<any> {
    const client = tx || prisma;
    return client.rawMaterialPurchaseRequest.updateMany(args) as Promise<any>;
  },
};
