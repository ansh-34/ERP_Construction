import prisma from '@/infra/database/prisma/prisma.client';
import type {
  AlertSeverity,
  AlertStatus,
  Prisma,
} from '@infra/database/prisma/generated/prisma/client';

export interface CreateAlertInput {
  moduleCode: string;
  alertCode: string;
  entityType: string;
  entityId: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  metadata?: Prisma.InputJsonValue;
  domainId: string;
  adminId: string;
}

export interface AlertFilters {
  moduleCode?: string;
  alertCode?: string;
  alertStatus?: AlertStatus;
  entityType?: string;
  entityId?: string;
  searchKey?: string;
}

const alertInclude = {
  notifications: {
    select: {
      id: true,
      recipientType: true,
      recipientId: true,
      isRead: true,
      readAt: true,
      createdAt: true,
    },
  },
} as const;

export const alertRepository = {
  create(data: CreateAlertInput) {
    return prisma.alert.create({
      data,
      include: alertInclude,
    });
  },

  findActiveByEntityForDate(
    domainId: string,
    adminId: string,
    moduleCode: string,
    alertCode: string,
    entityType: string,
    entityId: string,
    usageDate: string,
  ) {
    return prisma.alert.findFirst({
      where: {
        domainId,
        adminId,
        moduleCode,
        alertCode,
        entityType,
        entityId,
        alertStatus: 'ACTIVE',
        metadata: { path: ['usageDate'], equals: usageDate },
      },
      include: alertInclude,
    });
  },

  findActiveByEntity(
    domainId: string,
    adminId: string,
    moduleCode: string,
    alertCode: string,
    entityType: string,
    entityId: string,
  ) {
    return prisma.alert.findFirst({
      where: {
        domainId,
        adminId,
        moduleCode,
        alertCode,
        entityType,
        entityId,
        alertStatus: 'ACTIVE',
      },
      include: alertInclude,
    });
  },

  list(
    domainId: string,
    adminId: string,
    filters: AlertFilters = {},
    offset = 0,
    limit = 10,
  ) {
    return prisma.alert.findMany({
      where: buildWhere(domainId, adminId, filters),
      include: alertInclude,
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
    });
  },

  count(domainId: string, adminId: string, filters: AlertFilters = {}) {
    return prisma.alert.count({
      where: buildWhere(domainId, adminId, filters),
    });
  },

  findById(id: string, domainId: string, adminId: string) {
    return prisma.alert.findFirst({
      where: { id, domainId, adminId },
      include: alertInclude,
    });
  },

  updateStatus(
    id: string,
    domainId: string,
    adminId: string,
    alertStatus: AlertStatus,
  ) {
    return prisma.alert.updateMany({
      where: { id, domainId, adminId },
      data: {
        alertStatus,
        resolvedAt: alertStatus === 'RESOLVED' ? new Date() : undefined,
      },
    });
  },

  resolveActiveByEntityForDate(
    domainId: string,
    adminId: string,
    moduleCode: string,
    alertCode: string,
    entityType: string,
    entityId: string,
    usageDate: string,
  ) {
    return prisma.alert.updateMany({
      where: {
        domainId,
        adminId,
        moduleCode,
        alertCode,
        entityType,
        entityId,
        alertStatus: 'ACTIVE',
        metadata: { path: ['usageDate'], equals: usageDate },
      },
      data: { alertStatus: 'RESOLVED', resolvedAt: new Date() },
    });
  },
};

function buildWhere(domainId: string, adminId: string, filters: AlertFilters) {
  return {
    domainId,
    adminId,
    ...(filters.moduleCode ? { moduleCode: filters.moduleCode } : {}),
    ...(filters.alertCode ? { alertCode: filters.alertCode } : {}),
    ...(filters.alertStatus ? { alertStatus: filters.alertStatus } : {}),
    ...(filters.entityType ? { entityType: filters.entityType } : {}),
    ...(filters.entityId ? { entityId: filters.entityId } : {}),
    ...(filters.searchKey
      ? {
          OR: [
            { title: { contains: filters.searchKey } },
            { message: { contains: filters.searchKey } },
            { moduleCode: { contains: filters.searchKey } },
            { alertCode: { contains: filters.searchKey } },
          ],
        }
      : {}),
  };
}
