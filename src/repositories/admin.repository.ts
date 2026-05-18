import prisma from '../infra/database/prisma/prisma.client.js';

export const AdminRepository = {
  findActiveByEmail(email: string) {
    return prisma.admin.findFirst({
      where: { email, isDeleted: false },
    });
  },

  findActiveById(
    id: string,
    options: { select?: any; transaction?: any } = {},
  ) {
    const prismaClient = options?.transaction || prisma;
    return prismaClient.admin.findFirst({
      where: { id, isDeleted: false },
      ...(options.select ? { select: options.select } : {}),
    });
  },

  create(
    data: {
      name: string;
      email: string;
      phone: string | null;
      phoneCode: string | null;
      password: string;
      mediaId?: string;
    },
    options: { transaction?: any } = {},
  ) {
    const prismaClient = options?.transaction || prisma;
    return prismaClient.admin.create({
      data: {
        ...data,
        onboardingStep: 'EMAIL_VERIFICATION',
      },
    });
  },

  listActive(
    limit: number,
    offset: number,
    options: {
      filters?: { searchKey?: string; status?: string };
      select?: any;
    } = {},
  ) {
    const whereClause: any = {
      isDeleted: false,
      ...(options.filters && {
        ...(options.filters.searchKey && {
          name: {
            contains: options.filters.searchKey,
            mode: 'insensitive',
          },
        }),
        ...(options.filters.status && { status: options.filters.status }),
      }),
    };
    return prisma.$transaction([
      prisma.admin.count({
        where: whereClause,
      }),
      prisma.admin.findMany({
        where: whereClause,
        ...(options.select
          ? { select: options.select }
          : {
              select: {
                id: true,
                name: true,
                code: true,
                symbol: true,
                flag: true,
                status: true,
                createdAt: true,
                updatedAt: true,
              },
            }),
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
    ]);
  },

  update(id: string, data: any) {
    return prisma.admin.update({
      where: { id },
      data,
    });
  },

  softDelete(id: string) {
    return prisma.admin.update({
      where: { id },
      data: { isDeleted: true },
    });
  },
};
