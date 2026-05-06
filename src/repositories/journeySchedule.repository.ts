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
};
