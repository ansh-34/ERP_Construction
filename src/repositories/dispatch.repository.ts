import prisma from '../infra/database/prisma/prisma.client.js';

export const DispatchRepository = {
  findDuplicateForVehicle(code: string, domainId: string, vehicleId: string) {
    return prisma.dispatchVehicle.findFirst({
      where: { code, domainId, isDeleted: false, vehicleId },
    });
  },

  create(data: any) {
    return prisma.dispatchVehicle.create({ data });
  },

  listByDomain(domainId: string, limit: number, offset: number) {
    return prisma.$transaction([
      prisma.dispatchVehicle.count({ where: { domainId, isDeleted: false } }),
      prisma.dispatchVehicle.findMany({
        where: { domainId, isDeleted: false },
        include: {
          vehicle: {
            select: { id: true, numberPlate: true, vehicleType: true },
          },
          journeySchedule: {
            select: {
              id: true,
              code: true,
              startLocation: true,
              endLocation: true,
            },
          },
          loadedQuantityUom: true,
          vehicleWeightUom: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
    ]);
  },

  async getStats(domainId: string) {
    const where = { domainId, isDeleted: false };

    const [
      total,
      scheduledCount,
      inTransitCount,
      deliveredCount,
      cancelledCount,
      pendingLoadCount,
      loadedLoadCount,
      aggregation,
    ] = await prisma.$transaction([
      prisma.dispatchVehicle.count({ where }),
      prisma.dispatchVehicle.count({
        where: { ...where, journeyStatus: 'SCHEDULED' },
      }),
      prisma.dispatchVehicle.count({
        where: { ...where, journeyStatus: 'IN_TRANSIT' },
      }),
      prisma.dispatchVehicle.count({
        where: { ...where, journeyStatus: 'DELIVERED' },
      }),
      prisma.dispatchVehicle.count({
        where: { ...where, journeyStatus: 'CANCELLED' },
      }),
      prisma.dispatchVehicle.count({
        where: { ...where, loadingStatus: 'PENDING' },
      }),
      prisma.dispatchVehicle.count({
        where: { ...where, loadingStatus: 'LOADED' },
      }),
      prisma.dispatchVehicle.aggregate({
        where,
        _sum: {
          loadedQuantity: true,
          distance: true,
          expectedFuelValue: true,
          actualFuelValue: true,
        },
        _avg: {
          loadedQuantity: true,
          distance: true,
        },
      }),
    ]);

    return {
      totalDispatches: total,
      journeyStatusBreakdown: {
        scheduled: scheduledCount,
        inTransit: inTransitCount,
        delivered: deliveredCount,
        cancelled: cancelledCount,
      },
      loadingStatusBreakdown: {
        pending: pendingLoadCount,
        loaded: loadedLoadCount,
      },
      totalLoadedQuantity: aggregation._sum.loadedQuantity ?? 0,
      avgLoadedQuantity:
        Math.round((aggregation._avg.loadedQuantity ?? 0) * 100) / 100,
      totalDistance: aggregation._sum.distance ?? 0,
      avgDistance: Math.round((aggregation._avg.distance ?? 0) * 100) / 100,
      fuelSummary: {
        totalExpectedFuel: aggregation._sum.expectedFuelValue ?? 0,
        totalActualFuel: aggregation._sum.actualFuelValue ?? 0,
      },
    };
  },
};
