import prisma from '../infra/database/prisma/prisma.client.js';

export const JourneyScheduleRepository = {
  findActiveByIdAndDomain(id: string, domainId: string) {
    return prisma.vehicleJourneySchedule.findFirst({
      where: { id, domainId, isDeleted: false },
    });
  },

  findDuplicateForVehicle(code: string, domainId: string, truckId: string) {
    return prisma.vehicleJourneySchedule.findFirst({
      where: { code, domainId, isDeleted: false, truckId },
    });
  },

  create(data: any) {
    return prisma.vehicleJourneySchedule.create({ data });
  },

  listByDomain(domainId: string, limit: number, offset: number) {
    return prisma.$transaction([
      prisma.vehicleJourneySchedule.count({
        where: { domainId, isDeleted: false },
      }),
      prisma.vehicleJourneySchedule.findMany({
        where: { domainId, isDeleted: false },
        include: {
          truck: { select: { id: true, numberPlate: true, vehicleType: true } },
          loadedQuantityUom: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
    ]);
  },

  async getStats(domainId: string) {
    const where = { domainId, isDeleted: false };

    const [total, pendingCount, loadedCount, inTransitCount, aggregation] =
      await prisma.$transaction([
        prisma.vehicleJourneySchedule.count({ where }),
        prisma.vehicleJourneySchedule.count({
          where: { ...where, loadingStatus: 'PENDING' },
        }),
        prisma.vehicleJourneySchedule.count({
          where: { ...where, loadingStatus: 'LOADED' },
        }),
        prisma.vehicleJourneySchedule.count({
          where: { ...where, loadingStatus: 'IN_TRANSIT' },
        }),
        prisma.vehicleJourneySchedule.aggregate({
          where,
          _sum: {
            loadedQuantity: true,
            distance: true,
            expectedFuelValue: true,
          },
          _avg: {
            loadedQuantity: true,
            distance: true,
          },
        }),
      ]);

    return {
      totalSchedules: total,
      loadingStatusBreakdown: {
        pending: pendingCount,
        loaded: loadedCount,
        inTransit: inTransitCount,
      },
      totalLoadedQuantity: aggregation._sum.loadedQuantity ?? 0,
      avgLoadedQuantity:
        Math.round((aggregation._avg.loadedQuantity ?? 0) * 100) / 100,
      totalDistance: aggregation._sum.distance ?? 0,
      avgDistance: Math.round((aggregation._avg.distance ?? 0) * 100) / 100,
      totalExpectedFuel: aggregation._sum.expectedFuelValue ?? 0,
    };
  },
};
