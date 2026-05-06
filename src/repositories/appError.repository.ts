import prisma from '../infra/database/prisma/prisma.client.js';

export const AppErrorRepository = {
  create(data: {
    deviceName: string;
    version: string;
    error: string;
    functionName: string;
    domainId: string;
  }) {
    return prisma.appError.create({ data });
  },

  listByDomain(where: any, limit: number, offset: number) {
    return prisma.$transaction([
      prisma.appError.count({ where }),
      prisma.appError.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
    ]);
  },
};
