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
        include: { loadCapacityUom: true },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
    ]);
  },
};
