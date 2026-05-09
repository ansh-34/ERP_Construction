import { Prisma } from '@infra/database/prisma/generated/prisma/client';
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
};