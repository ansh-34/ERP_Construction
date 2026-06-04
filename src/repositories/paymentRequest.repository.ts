import prisma from '@/infra/database/prisma/prisma.client';

export const PaymentRequestRepository = {
  async create(data: any) {
    return prisma.paymentRequest.create({ data });
  },

  async findByIdAndDomain(id: string, domainId: string) {
    return prisma.paymentRequest.findFirst({
      where: { id, domainId, isDeleted: false },
    });
  },

  async findByIdWithDetails(id: string, domainId: string) {
    return prisma.paymentRequest.findFirst({
      where: { id, domainId, isDeleted: false },
      include: {
        vendor: true,
        project: true,
        requestedUser: { select: { id: true, name: true, email: true } },
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
      paymentStatus?: string;
      projectId?: string;
      vendorId?: string;
      isDeleted?: boolean;
    },
  ) {
    const where: any = {
      domainId,
      isDeleted: filters.isDeleted ?? false,
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.paymentStatus
        ? { paymentStatus: filters.paymentStatus }
        : {}),
      ...(filters.projectId ? { projectId: filters.projectId } : {}),
      ...(filters.vendorId ? { vendorId: filters.vendorId } : {}),
      ...(filters.searchKey
        ? {
            OR: [
              { code: { contains: filters.searchKey, mode: 'insensitive' } },
              {
                referenceNumber: {
                  contains: filters.searchKey,
                  mode: 'insensitive',
                },
              },
              { notes: { contains: filters.searchKey, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    return prisma.$transaction([
      prisma.paymentRequest.count({ where }),
      prisma.paymentRequest.findMany({
        where,
        include: {
          vendor: true,
          project: true,
          requestedUser: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
    ]);
  },

  async update(id: string, data: any) {
    return prisma.paymentRequest.update({
      where: { id },
      data,
    });
  },

  async softDelete(id: string) {
    return prisma.paymentRequest.update({
      where: { id },
      data: { isDeleted: true, status: 'INACTIVE' },
    });
  },
};
