import prisma from '../infra/database/prisma/prisma.client.js';

export const VehicleRepository = {
  findActiveByNumberPlate(numberPlate: string) {
    return prisma.vehicle.findFirst({
      where: { numberPlate, isDeleted: false },
    });
  },

  findActiveByIdAndDomain(id: string, domainId: string) {
    return prisma.vehicle.findFirst({
      where: { id, domainId, isDeleted: false },
    });
  },

  findByIdWithDetails(id: string, domainId: string) {
    return prisma.vehicle.findFirst({
      where: { id, domainId, isDeleted: false },
      include: {
        loadCapacityUom: true,
        journeySchedules: {
          where: { isDeleted: false },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            code: true,
            description: true,
            driverName: true,
            startLocation: true,
            endLocation: true,
            distance: true,
            average: true,
            loadedQuantity: true,
            loadedAt: true,
            loadingStatus: true,
            expectedFuelValue: true,
            fuelAlertThreshold: true,
            date: true,
            status: true,
            createdAt: true,
            loadedQuantityUom: {
              select: { id: true, displayName: true, code: true },
            },
          },
        },
        dispatches: {
          where: { isDeleted: false },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            code: true,
            description: true,
            driverName: true,
            startLocation: true,
            endLocation: true,
            distance: true,
            average: true,
            loadedQuantity: true,
            loadingStatus: true,
            journeyStatus: true,
            journeyStatusUpdatedAt: true,
            actualFuelValue: true,
            expectedFuelValue: true,
            fuelAlertThreshold: true,
            date: true,
            status: true,
            createdAt: true,
            loadedQuantityUom: {
              select: { id: true, displayName: true, code: true },
            },
            journeySchedule: {
              select: { id: true, code: true },
            },
          },
        },
      },
    });
  },

  create(data: {
    numberPlate: string;
    vehicleType: string;
    loadCapacity: number;
    loadCapacityUomId: string | null;
    alertLoadThreshold: number;
    domainId: string;
  }) {
    return prisma.vehicle.create({ data });
  },

  listByDomain(domainId: string, limit: number, offset: number) {
    return prisma.$transaction([
      prisma.vehicle.count({ where: { domainId, isDeleted: false } }),
      prisma.vehicle.findMany({
        where: { domainId, isDeleted: false },
        include: {
          loadCapacityUom: true,
          // Latest journey schedule — shows current loading info
          journeySchedules: {
            where: { isDeleted: false },
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: {
              id: true,
              code: true,
              driverName: true,
              startLocation: true,
              endLocation: true,
              distance: true,
              loadedQuantity: true,
              loadedAt: true,
              loadingStatus: true,
              expectedFuelValue: true,
              date: true,
              loadedQuantityUom: {
                select: { id: true, displayName: true, code: true },
              },
            },
          },
          // Latest dispatch — shows current journey status
          dispatches: {
            where: { isDeleted: false },
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: {
              id: true,
              code: true,
              driverName: true,
              startLocation: true,
              endLocation: true,
              distance: true,
              loadedQuantity: true,
              loadingStatus: true,
              journeyStatus: true,
              journeyStatusUpdatedAt: true,
              actualFuelValue: true,
              expectedFuelValue: true,
              date: true,
              loadedQuantityUom: {
                select: { id: true, displayName: true, code: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
    ]);
  },

  async getStats(domainId: string) {
    const [totalVehicles, activeVehicles, capacityAgg] =
      await prisma.$transaction([
        prisma.vehicle.count({ where: { domainId, isDeleted: false } }),
        prisma.vehicle.count({
          where: { domainId, isDeleted: false, status: 'ACTIVE' },
        }),
        prisma.vehicle.aggregate({
          where: { domainId, isDeleted: false },
          _sum: { loadCapacity: true },
        }),
      ]);

    // Vehicle type breakdown via raw SQL (Prisma groupBy needs enum, vehicleType is String)
    const typeBreakdown = await prisma.$queryRaw<
      { vehicleType: string; count: bigint }[]
    >`
      SELECT "vehicleType", COUNT(*)::bigint AS count
      FROM "Vehicle"
      WHERE "domainId" = ${domainId}::uuid AND "isDeleted" = false
      GROUP BY "vehicleType"
      ORDER BY count DESC
    `;

    return {
      totalVehicles,
      activeVehicles,
      inactiveVehicles: totalVehicles - activeVehicles,
      totalLoadCapacity: capacityAgg._sum.loadCapacity ?? 0,
      vehiclesByType: typeBreakdown.map((r) => ({
        vehicleType: r.vehicleType,
        count: Number(r.count),
      })),
    };
  },
};
