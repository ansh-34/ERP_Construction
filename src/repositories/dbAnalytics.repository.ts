import prisma from '../infra/database/prisma/prisma.client.js';

export const DbAnalyticsRepository = {
  findManyByDateRange(start: Date, end: Date) {
    return prisma.dbAnalytics.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { date: 'asc' },
    });
  },

  upsert(
    date: Date,
    stats: {
      totalRequests: number;
      successCount: number;
      failureCount: number;
      avgResponseTime: number;
      maxResponseTime: number;
      minResponseTime: number;
      mostHitApi: string;
      mostHitCount: number;
      mostFailedApi: string | null;
      mostFailedCount: number;
    },
  ) {
    return prisma.dbAnalytics.upsert({
      where: { date },
      create: {
        date,
        ...stats,
      },
      update: stats,
    });
  },
};
