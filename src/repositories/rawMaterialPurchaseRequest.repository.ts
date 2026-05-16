import prisma from '@/infra/database/prisma/prisma.client';

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
      type?: string;
      approvalStatus?: string;
      productId?: string;
      projectId?: string;
    },
  ) {
    const where: any = {
      domainId,
      isDeleted: false,
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
              { vendor: { contains: filters.searchKey, mode: 'insensitive' } },
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
      data: { isDeleted: true },
    });
  },

  async bulkUpdateApproval(
    ids: string[],
    approvalStatus: string,
    domainId: string,
  ) {
    return prisma.rawMaterialPurchaseRequest.updateMany({
      where: { id: { in: ids }, domainId, isDeleted: false },
      data: { approvalStatus: approvalStatus as any, approvedAt: new Date() },
    });
  },

  async approveAndCreatePO(
    ids: string[],
    domainId: string,
    poCode: string,
  ) {
    return prisma.$transaction(async (tx) => {
      // 1. Fetch the requests to get details for the PO
      const requests = await tx.rawMaterialPurchaseRequest.findMany({
        where: { id: { in: ids }, domainId },
        include: { product: true, productGrade: true },
      });

      if (requests.length === 0) return { count: 0 };

      // Calculate totals (assuming rate/tax as 0 initially or from some other logic, but requests don't have rate/tax)
      const totalItems = requests.length;
      let totalAmount = 0; // Requests don't have price, PO rate defaults to 0
      const vendor = requests[0].vendor || 'Unknown Vendor';
      const projectId = requests[0].projectId;

      // 2. Create the Purchase Order
      const po = await tx.purchaseOrder.create({
        data: {
          code: poCode,
          vendor,
          totalItems,
          totalTax: 0,
          totalAmount,
          orderStatus: 'CONFIRMED',
          projectId,
          domainId,
        },
      });

      // 3. Create Purchase Order Products
      await tx.purchaseOrderProduct.createMany({
        data: requests.map((req) => ({
          purchaseOrderId: po.id,
          orderCode: po.code,
          productName: typeof req.product.displayName === 'string' ? req.product.displayName : JSON.stringify(req.product.displayName),
          productGradeName: req.productGrade ? (typeof req.productGrade.gradeDisplayName === 'string' ? req.productGrade.gradeDisplayName : JSON.stringify(req.productGrade.gradeDisplayName)) : undefined,
          quantity: req.quantity,
          uomId: req.uomId,
          projectId: req.projectId,
          domainId: req.domainId,
        })),
      });

      // 4. Update the requests to APPROVED and link the PO
      const result = await tx.rawMaterialPurchaseRequest.updateMany({
        where: { id: { in: ids }, domainId },
        data: {
          approvalStatus: 'APPROVED',
          approvedAt: new Date(),
          purchaseOrderId: po.id,
        },
      });

      return result;
    });
  },
};
