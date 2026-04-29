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
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
    ]);
  },
};
