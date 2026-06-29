import { Prisma } from '@infra/database/prisma/generated/prisma/client/client';
import prisma from '../infra/database/prisma/prisma.client.js';

const include = {
  project: { select: { id: true, name: true, code: true } },
  operator: { select: { id: true, name: true, email: true } },
} as const;

export const weighBridgeRepository = {
  create(data: Prisma.WeighBridgeUncheckedCreateInput) {
    return prisma.weighBridge.create({ data, include });
  },

  listByDomain(
    domainId: string,
    adminId: string,
    limit: number,
    offset: number,
    filter?: {
      status?: 'ACTIVE' | 'INACTIVE';
      weighBridgeStatus?: string;
      projectId?: string;
      searchKey?: string;
    },
  ) {
    const searchKey = filter?.searchKey?.trim() || '';
    const where: Prisma.WeighBridgeWhereInput = {
      domainId,
      adminId,
      isDeleted: false,
      ...(filter?.status && { status: filter.status }),
      ...(filter?.weighBridgeStatus && {
        weighBridgeStatus: filter.weighBridgeStatus,
      }),
      ...(filter?.projectId && { projectId: filter.projectId }),
      ...(searchKey && {
        OR: [
          { ticketNumber: { contains: searchKey, mode: 'insensitive' } },
          { driverName: { contains: searchKey, mode: 'insensitive' } },
          { vehicleNo: { contains: searchKey, mode: 'insensitive' } },
          { supplier: { contains: searchKey, mode: 'insensitive' } },
          { gateNoteNo: { contains: searchKey, mode: 'insensitive' } },
          { operatorName: { contains: searchKey, mode: 'insensitive' } },
        ],
      }),
    };

    return prisma.$transaction([
      prisma.weighBridge.count({ where }),
      prisma.weighBridge.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include,
      }),
    ]);
  },

  findByIdAndDomain(id: string, domainId: string, adminId: string) {
    return prisma.weighBridge.findFirst({
      where: { id, domainId, adminId, isDeleted: false },
      include,
    });
  },

  update(id: string, data: Prisma.WeighBridgeUncheckedUpdateInput) {
    return prisma.weighBridge.update({ where: { id }, data, include });
  },

  softDelete(id: string) {
    return prisma.weighBridge.update({
      where: { id },
      data: { isDeleted: true, status: 'INACTIVE' },
    });
  },

  getTicketNumbers(domainId: string) {
    return prisma.weighBridge.findMany({
      where: { domainId, ticketNumber: { startsWith: 'WB-' } },
      select: { ticketNumber: true },
    });
  },
};
